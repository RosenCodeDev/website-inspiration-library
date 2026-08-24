import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(toolDir, '..');
const workDir = path.join(appRoot, 'capture-work', 'smooth');
const masterDir = path.join(workDir, 'masters');
const finalDir = path.join(workDir, 'final');
const qaDir = path.join(workDir, 'qa');
const profileDir = path.join(workDir, 'chrome-profile');
const ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const targetWidth = 1440;
const targetHeight = 900;
const requestedFps = Number(process.env.CAPTURE_FPS ?? 30);

const recipes = [
  { name: 'spade', url: 'https://spade.com/', kind: 'ambient', settle: 5500, actionDuration: 8000, trimStart: 0.8, finalDuration: 8 },
  { name: 'sstr', url: 'https://sstr.tech/en/', kind: 'scroll', settle: 4500, actionDuration: 19000, trimStart: 0, finalDuration: 21 },
  { name: 'igloo', url: 'https://www.igloo.inc/', kind: 'igloo', settle: 3500, actionDuration: 7500, trimStart: 0, finalDuration: 12.3 },
  { name: 'lusion', url: 'https://lusion.co/', kind: 'pointer', settle: 5500, actionDuration: 5500, trimStart: 0, finalDuration: 10.8 },
  { name: 'schemas', url: 'https://schemasofuncertainty.com/', kind: 'ambient', settle: 3000, actionDuration: 6000, trimStart: 0, finalDuration: 7.8 },
  { name: 'system-patch', url: 'https://system.studio/work/patch', kind: 'scroll', settle: 5500, actionDuration: 18000, trimStart: 0, finalDuration: 20 },
  { name: 'coda', url: 'https://www.coda.co/', kind: 'scroll', settle: 5000, actionDuration: 16000, trimStart: 0, finalDuration: 18 },
  { name: 'paper', url: 'https://paper.design/', kind: 'scroll', settle: 6000, actionDuration: 16000, trimStart: 0, finalDuration: 18 },
  { name: 'oqoqo', url: 'https://oqoqo.ai/', kind: 'scroll', settle: 5500, actionDuration: 16000, trimStart: 0, finalDuration: 18 },
  { name: 'cursor', url: 'https://cursor.com/home', kind: 'scroll', settle: 6500, actionDuration: 19000, trimStart: 0, finalDuration: 21, detailFile: 'cursor.png' },
  { name: 'aside', url: 'https://aside.com/', kind: 'scroll', settle: 5000, openingHold: 1600, actionDuration: 14000, trimStart: 0, finalDuration: 18 },
  { name: 'jitter', url: 'https://madewithjitter.com/', kind: 'scroll', settle: 5000, openingHold: 1600, actionDuration: 15000, trimStart: 0, finalDuration: 19, resetVisibleVideos: true },
  { name: 'plinth', url: 'https://plinthai.xyz/', kind: 'scroll', settle: 6000, actionDuration: 20000, trimStart: 0, finalDuration: 22, detailFile: 'plinth.png' },
  { name: 'fin', url: 'https://www.fin.com/', kind: 'scroll', settle: 6500, actionDuration: 24000, trimStart: 0, finalDuration: 26, detailFile: 'fin.png' },
];

const requestedNames = (process.env.CAPTURE_NAMES ?? '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

if (!requestedNames.length) {
  throw new Error('Set CAPTURE_NAMES to one or more of: ' + recipes.map((recipe) => recipe.name).join(', '));
}
if (![30, 60].includes(requestedFps)) throw new Error('CAPTURE_FPS must be 30 or 60.');
const unknownNames = requestedNames.filter((name) => !recipes.some((recipe) => recipe.name === name));
if (unknownNames.length) throw new Error('Unknown capture recipe(s): ' + unknownNames.join(', '));
const selectedRecipes = recipes.filter((recipe) => requestedNames.includes(recipe.name));

await Promise.all([masterDir, finalDir, qaDir, profileDir].map((directory) => mkdir(directory, { recursive: true })));

const hideScrollbars = () => {
  const install = () => {
    if (document.getElementById('codex-hide-scrollbars')) return;
    const style = document.createElement('style');
    style.id = 'codex-hide-scrollbars';
    style.textContent = 'html,body,*{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}';
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
};

const waitForVisualReadiness = async (page, settle) => {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await document.fonts?.ready;
    const images = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    });
    await Promise.all(images.map((image) => image.complete
      ? image.decode?.().catch(() => {})
      : new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 8000);
        })));
  });
  await page.waitForTimeout(settle);
};

const dismissKnownOverlays = async (page) => {
  for (let pass = 0; pass < 3; pass += 1) {
    const candidates = [
      page.getByRole('button', { name: /^decline$/i }),
      page.getByRole('button', { name: /reject all/i }),
      page.getByRole('button', { name: /accept cookies/i }),
      page.getByRole('button', { name: /accept all/i }),
      page.getByRole('button', { name: /allow all/i }),
      page.getByRole('button', { name: /^close$/i }),
    ];
    let dismissed = false;
    for (const candidate of candidates) {
      if (await candidate.first().isVisible().catch(() => false)) {
        await candidate.first().click().catch(() => {});
        await page.waitForTimeout(500);
        dismissed = true;
        break;
      }
    }
    if (!dismissed) break;
  }
};

const prewarmScrollAssets = async (page) => {
  const maxScroll = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight);
  if (maxScroll <= 0) return;
  for (let step = 1; step <= 8; step += 1) {
    await page.evaluate((top) => scrollTo(0, top), Math.round(maxScroll * step / 8));
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(700);
};

const sizeContentViewport = async (page, width = targetWidth, height = targetHeight) => {
  const session = await page.context().newCDPSession(page);
  const windowInfo = await session.send('Browser.getWindowForTarget');
  const windowId = windowInfo.windowId;
  const bounds = windowInfo.bounds;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const metrics = await page.evaluate(() => ({ innerWidth, innerHeight, outerWidth, outerHeight }));
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: {
        left: 0,
        top: 0,
        width: Math.round((bounds.width ?? metrics.outerWidth) + width - metrics.innerWidth),
        height: Math.round((bounds.height ?? metrics.outerHeight) + height - metrics.innerHeight),
        windowState: 'normal',
      },
    });
    await page.waitForTimeout(350);
    const current = await page.evaluate(() => ({ innerWidth, innerHeight }));
    if (current.innerWidth === width && current.innerHeight === height) break;
  }
  const finalMetrics = await page.evaluate(() => ({
    innerWidth, innerHeight, outerWidth, outerHeight, screenX, screenY, devicePixelRatio,
  }));
  if (finalMetrics.innerWidth !== width || finalMetrics.innerHeight !== height) {
    throw new Error('Viewport is ' + finalMetrics.innerWidth + 'x' + finalMetrics.innerHeight + ', expected ' + width + 'x' + height + '.');
  }
  if (finalMetrics.devicePixelRatio !== 1) {
    throw new Error('Unexpected devicePixelRatio ' + finalMetrics.devicePixelRatio + '.');
  }
  const sideBorder = Math.max(0, Math.round((finalMetrics.outerWidth - finalMetrics.innerWidth) / 2));
  return {
    ...finalMetrics,
    captureX: Math.round(finalMetrics.screenX + sideBorder),
    captureY: Math.round(finalMetrics.screenY + finalMetrics.outerHeight - finalMetrics.innerHeight - sideBorder),
  };
};

const runProcess = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { windowsHide: true, ...options });
  let stderr = '';
  if (child.stderr) child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.once('error', reject);
  child.once('exit', (code) => {
    if (code === 0) resolve(stderr);
    else reject(new Error(path.basename(command) + ' exited with ' + code + '\n' + stderr));
  });
});

const startCapture = async (name, metrics) => {
  const outputPath = path.join(masterDir, name + '-' + requestedFps + 'fps.mkv');
  const logPath = path.join(qaDir, name + '-' + requestedFps + 'fps-ffmpeg.log');
  await rm(outputPath, { force: true });
  const args = [
    '-hide_banner', '-y', '-thread_queue_size', '1024',
    '-f', 'gdigrab', '-draw_mouse', '0', '-framerate', String(requestedFps),
    '-offset_x', String(metrics.captureX), '-offset_y', String(metrics.captureY),
    '-video_size', targetWidth + 'x' + targetHeight, '-i', 'desktop',
    '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '12', '-pix_fmt', 'yuv420p',
    outputPath,
  ];
  const process = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true });
  let log = '';
  process.stderr.on('data', (chunk) => { log += chunk.toString(); });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 1200);
    process.once('error', (error) => { clearTimeout(timer); reject(error); });
    process.once('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error('FFmpeg exited before capture with code ' + code + '\n' + log));
      else resolve();
    });
  });
  return {
    outputPath,
    stop: async () => {
      process.stdin.write('q');
      await new Promise((resolve) => process.once('exit', resolve));
      await writeFile(logPath, log);
      return logPath;
    },
  };
};

const smoothScroll = async (page, duration) => {
  const result = await page.evaluate(async (totalDuration) => {
    const sections = 7;
    const hold = 320;
    const movingDuration = Math.max(1000, totalDuration - hold * (sections - 1) - 900);
    const sectionDuration = movingDuration / sections;
    const ease = (value) => value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
    for (let section = 0; section < sections; section += 1) {
      const from = scrollY;
      await new Promise((resolve) => {
        const started = performance.now();
        const frame = (now) => {
          const progress = Math.min(1, (now - started) / sectionDuration);
          const currentMax = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight;
          const to = currentMax * (section + 1) / sections;
          scrollTo(0, from + (to - from) * ease(progress));
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      if (section < sections - 1) await new Promise((resolve) => setTimeout(resolve, hold));
    }
    for (let pass = 0; pass < 6; pass += 1) {
      const currentMax = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight;
      scrollTo(0, currentMax);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const maxScroll = scrollHeight - innerHeight;
    return { scrollY, scrollHeight, innerHeight, maxScroll, remaining: Math.max(0, maxScroll - scrollY) };
  }, duration);
  if (result.remaining > 4) {
    throw new Error(`Scroll capture stopped ${Math.round(result.remaining)}px before the document bottom.`);
  }
  return result;
};

const smoothPointer = async (page, duration, igloo = false) => {
  const points = igloo
    ? [[720, 460], [650, 430], [790, 445], [705, 520], [820, 500], [680, 475], [755, 440]]
    : [[500, 500], [650, 410], [820, 480], [930, 390], [750, 560], [570, 450], [820, 430]];
  const segments = points.length - 1;
  const framesPerSegment = Math.max(18, Math.round(requestedFps * duration / 1000 / segments));
  await page.mouse.move(points[0][0], points[0][1]);
  for (let index = 0; index < segments; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    for (let frame = 1; frame <= framesPerSegment; frame += 1) {
      const progress = frame / framesPerSegment;
      const eased = progress * progress * (3 - 2 * progress);
      await page.mouse.move(start[0] + (end[0] - start[0]) * eased, start[1] + (end[1] - start[1]) * eased);
      await page.waitForTimeout(1000 / requestedFps);
    }
  }
};

const encodeAndMakeContactSheet = async (recipe, masterPath) => {
  const finalPath = path.join(finalDir, recipe.name + '.mp4');
  const contactPath = path.join(qaDir, recipe.name + '-contact.png');
  await rm(finalPath, { force: true });
  await runProcess(ffmpegPath, [
    '-hide_banner', '-y', '-ss', String(recipe.trimStart), '-t', String(recipe.finalDuration),
    '-i', masterPath, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-profile:v', 'high', '-level:v', '4.1', '-pix_fmt', 'yuv420p', '-g', '60',
    '-movflags', '+faststart', finalPath,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  await runProcess(ffmpegPath, [
    '-hide_banner', '-y', '-i', finalPath,
    '-vf', 'fps=4/' + recipe.finalDuration + ',scale=720:450,tile=2x2', '-frames:v', '1', contactPath,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  return { finalPath, contactPath };
};

const results = [];
for (const recipe of selectedRecipes) {
  const recipeProfile = path.join(profileDir, recipe.name);
  await mkdir(recipeProfile, { recursive: true });
  const context = await chromium.launchPersistentContext(recipeProfile, {
    executablePath: chromePath,
    headless: false,
    viewport: null,
    reducedMotion: 'no-preference',
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--app=' + recipe.url, '--window-position=0,0', '--window-size=1460,960',
      '--force-device-scale-factor=1', '--hide-scrollbars',
      '--disable-features=OverlayScrollbar', '--autoplay-policy=no-user-gesture-required',
      '--no-first-run', '--no-default-browser-check',
    ],
  });
  await context.addInitScript(hideScrollbars);
  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);
  try {
    if (page.url() !== recipe.url) await page.goto(recipe.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    let metrics = await sizeContentViewport(page);
    await waitForVisualReadiness(page, recipe.settle);
    await dismissKnownOverlays(page);
    if (recipe.kind === 'scroll') {
      await prewarmScrollAssets(page);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await waitForVisualReadiness(page, recipe.settle);
      await dismissKnownOverlays(page);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(700);
    }
    if (recipe.detailFile) {
      await sizeContentViewport(page, 1600, 1000);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(finalDir, recipe.detailFile) });
      metrics = await sizeContentViewport(page);
      await page.waitForTimeout(600);
    }
    if (recipe.resetVisibleVideos) {
      await page.evaluate(async () => {
        const visibleVideos = [...document.querySelectorAll('video')].filter((video) => {
          const rect = video.getBoundingClientRect();
          return rect.width > 8 && rect.height > 8 && rect.bottom > 0 && rect.top < innerHeight;
        });
        for (const video of visibleVideos) {
          video.muted = true;
          video.currentTime = 0;
          await video.play().catch(() => {});
        }
      });
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(qaDir, recipe.name + '-opening.png') });
    await page.bringToFront();
    await page.waitForTimeout(300);
    const capture = await startCapture(recipe.name, metrics);
    if (recipe.openingHold) await page.waitForTimeout(recipe.openingHold);
    let scrollResult = null;
    if (recipe.kind === 'scroll') scrollResult = await smoothScroll(page, recipe.actionDuration);
    if (recipe.kind === 'pointer') await smoothPointer(page, recipe.actionDuration, false);
    if (recipe.kind === 'igloo') {
      await page.waitForTimeout(2300);
      await smoothPointer(page, recipe.actionDuration - 2300, true);
    }
    if (recipe.kind === 'ambient') await page.waitForTimeout(recipe.actionDuration);
    await page.waitForTimeout(700);
    const logPath = await capture.stop();
    const encoded = await encodeAndMakeContactSheet(recipe, capture.outputPath);
    results.push({ name: recipe.name, fps: requestedFps, metrics, scrollResult, master: capture.outputPath, log: logPath, ...encoded });
  } catch (error) {
    console.error('FAILED ' + recipe.name + ': ' + (error.stack ?? error.message));
  } finally {
    await context.close();
  }
}

await writeFile(path.join(workDir, 'capture-results-' + requestedFps + 'fps.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
