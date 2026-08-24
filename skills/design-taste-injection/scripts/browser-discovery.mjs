#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const executableNames = process.platform === 'win32'
  ? ['chrome.exe', 'msedge.exe', 'chromium.exe']
  : ['google-chrome', 'google-chrome-stable', 'microsoft-edge', 'microsoft-edge-stable', 'chromium', 'chromium-browser'];
const pathCandidates = () => (process.env.PATH ?? '').split(delimiter).filter(Boolean)
  .flatMap((folder) => executableNames.map((name) => resolve(folder, name)));
const standardCandidates = () => {
  if (process.platform === 'win32') return [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean).flatMap((base) => [
    resolve(base, 'Google/Chrome/Application/chrome.exe'), resolve(base, 'Microsoft/Edge/Application/msedge.exe'), resolve(base, 'Chromium/Application/chrome.exe'),
  ]);
  if (process.platform === 'darwin') return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  return ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'];
};
const browserCandidates = () => [process.env.DESIGN_TASTE_BROWSER_PATH, ...pathCandidates(), ...standardCandidates()].filter(Boolean);
const discoverBrowser = () => browserCandidates().find((candidate) => existsSync(candidate)) ?? null;

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) {
  const browser = discoverBrowser();
  if (browser) process.stdout.write(`${browser}\n`);
  else { console.error('No supported Chrome, Edge, or Chromium browser was found. Set DESIGN_TASTE_BROWSER_PATH to its executable.'); process.exitCode = 1; }
}

export { browserCandidates, discoverBrowser };
