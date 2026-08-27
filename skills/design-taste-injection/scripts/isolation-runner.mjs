#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertContainedPath } from './path-safety.mjs';
import { assertSealedPayload, renderVisualPrompt, scanExactSignals, scanSourceIdentity } from './visual-contract.mjs';

const RELEASE_MODEL = 'gpt-5.6-sol';
const DEGRADED_WARNING = 'This generation can see project intake and is not isolated.';
const DEGRADED_ACTION = 'RUN DEGRADED GENERATION';
const outputSchema = {
  type: 'object', additionalProperties: false, required: ['files', 'inspection'],
  properties: {
    files: {
      type: 'array', minItems: 1, maxItems: 20,
      items: { type: 'object', additionalProperties: false, required: ['path', 'content'], properties: { path: { type: 'string', pattern: '^(index\\.html|styles\\.css|script\\.js|assets/[A-Za-z0-9._/-]+)$' }, content: { type: 'string' } } },
    },
    inspection: { type: 'object', additionalProperties: false, required: ['stillSha256'], properties: { stillSha256: { type: 'string', pattern: '^[a-f0-9]{64}$' } } },
  },
};
const genericInstructions = [
  'You are a sealed visual-direction generator. Use only the supplied sealed payload and attached still.',
  'You have no tools, project context, catalog, sibling directions, motion, or conversation history.',
  'Return strict JSON matching the supplied schema. Do not emit markdown or external references.',
].join(' ');
const mimeFor = (path) => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' })[extname(path).toLowerCase()] ?? 'application/octet-stream';
const outputText = (response) => {
  if (typeof response?.output_text === 'string') return response.output_text;
  return (response?.output ?? []).flatMap((item) => item?.content ?? []).filter((item) => item?.type === 'output_text').map((item) => item.text).join('');
};
const assertNoPathLeak = (value, paths = []) => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  for (const path of paths.filter(Boolean)) if (serialized.toLowerCase().includes(String(path).replaceAll('\\', '/').toLowerCase()) || serialized.toLowerCase().includes(String(path).toLowerCase())) throw new Error('Sealed API request contains a protected project or library path.');
  if (/(?:file:\/\/|[A-Za-z]:\\)/i.test(serialized)) throw new Error('Sealed API request contains an absolute filesystem path.');
};
const validateEnvelope = (value, guards = {}) => {
  const intakeMatches = scanExactSignals(value, guards.leakSignals);
  if (intakeMatches.length) throw new Error(`Sealed API envelope contains intake leak signal: ${intakeMatches[0].value}`);
  assertNoPathLeak(value, [guards.projectRoot, guards.libraryRoot]);
  const serialized = JSON.stringify(value);
  for (const forbidden of ['motionClip', 'motionNotes', 'categoryProfile', 'categoryConstitution', 'catalogFingerprint', 'siblingCards', 'rejectedCards']) if (serialized.includes(`"${forbidden}"`)) throw new Error(`Sealed API envelope contains forbidden data: ${forbidden}`);
  return true;
};
const validateIdentityPlacement = (payload, prompt) => {
  const exactSignals = (payload?.identityExclusions?.reviewedSignals ?? []).filter((value) => {
    const normalized = String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); return normalized.includes('.') || normalized.split(/\s+/).filter(Boolean).length >= 2;
  });
  const signalDocument = { signals: exactSignals.map((value) => ({ value, normalized: String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim() })) };
  const sanitizedPayload = structuredClone(payload);
  if (sanitizedPayload.card) { sanitizedPayload.card.id = ''; sanitizedPayload.card.name = ''; }
  if (sanitizedPayload.identityExclusions) { sanitizedPayload.identityExclusions.exactSignals = []; sanitizedPayload.identityExclusions.derivedSignals = []; sanitizedPayload.identityExclusions.reviewedSignals = []; }
  const payloadMatches = scanExactSignals(sanitizedPayload, signalDocument);
  const promptWithoutAllowedIdentityLines = prompt.split(/\r?\n/).filter((line, index, lines) => {
    const previous = lines[index - 1] ?? '';
    return !line.startsWith('Exclude these reviewed source identities exactly:') && previous !== 'REFERENCE';
  }).join('\n');
  const promptMatches = scanExactSignals(promptWithoutAllowedIdentityLines, signalDocument);
  if (payloadMatches.length || promptMatches.length) throw new Error(`Sealed API request contains source identity outside reviewed exclusion metadata: ${(payloadMatches[0] ?? promptMatches[0]).value}`);
};
const buildSealedRequest = async (payload, stillPath, guards = {}) => {
  assertSealedPayload(payload, { requireChecksum: true });
  const bytes = await readFile(stillPath); const prompt = renderVisualPrompt(payload);
  if (payload.reference.sha256 && payload.reference.sha256 !== (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex')) throw new Error('Staged still does not match the sealed payload checksum.');
  const sealedText = JSON.stringify({ prompt, payload });
  validateEnvelope(sealedText, guards);
  validateIdentityPlacement(payload, prompt);
  const request = {
    model: guards.model ?? RELEASE_MODEL, store: false, background: false, stream: false, instructions: genericInstructions,
    input: [{ role: 'user', content: [{ type: 'input_text', text: sealedText }, { type: 'input_image', image_url: `data:${mimeFor(stillPath)};base64,${bytes.toString('base64')}`, detail: 'high' }] }],
    tools: [], tool_choice: 'none', reasoning: { effort: 'high' },
    text: { format: { type: 'json_schema', name: 'inspiration_preview_files', strict: true, schema: outputSchema } },
  };
  validateSealedRequest(request, guards);
  return request;
};
const validateSealedRequest = (request, guards = {}) => {
  const keys = Object.keys(request).sort();
  const expected = ['background', 'input', 'instructions', 'model', 'reasoning', 'store', 'stream', 'text', 'tool_choice', 'tools'].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) throw new Error('Sealed API request contains unexpected top-level fields.');
  if (request.store !== false || request.background !== false || request.stream !== false || request.tool_choice !== 'none' || !Array.isArray(request.tools) || request.tools.length) throw new Error('Sealed API request is not stateless and tool-free.');
  if ('conversation' in request || 'previous_response_id' in request || 'metadata' in request || 'prompt' in request) throw new Error('Sealed API request contains persisted context fields.');
  if (request.reasoning?.effort !== 'high' || request.text?.format?.type !== 'json_schema' || request.text.format.strict !== true) throw new Error('Sealed API request is missing high reasoning or strict structured output.');
  if (!guards.allowDevelopmentModel && request.model !== RELEASE_MODEL) throw new Error(`Release isolation requires ${RELEASE_MODEL}.`);
  if (request.input?.length !== 1 || request.input[0].content?.filter((item) => item.type === 'input_image').length !== 1) throw new Error('Sealed API request requires exactly one still image.');
  validateEnvelope(request, guards);
  return true;
};
const buildRetryRequest = (originalRequest, retry, guards = {}) => {
  if (!retry || !Array.isArray(retry.previousFiles) || !Array.isArray(retry.failures)) throw new Error('Retry requires previous files and machine-validation failures.');
  const correction = { previousFiles: retry.previousFiles, previewScreenshot: retry.previewScreenshot ?? null, machineValidationFailures: retry.failures, instruction: 'Correct only the listed machine-validation failures. Preserve the original sealed visual brief.' };
  validateEnvelope(correction, guards);
  const originalEnvelope = JSON.parse(originalRequest.input[0].content[0].text);
  const identityMatches = guards.sourceIdentity ? scanSourceIdentity(correction, guards.sourceIdentity) : scanExactSignals(correction, {
    signals: (originalEnvelope.payload?.identityExclusions?.exactSignals ?? []).filter((value) => {
      const normalized = String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); return normalized.includes('.') || normalized.split(/\s+/).filter(Boolean).length >= 2;
    }).map((value) => ({ value, normalized: String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim() })),
  });
  if (identityMatches.length) throw new Error(`Retry envelope contains source identity signal: ${identityMatches[0].value}`);
  const next = structuredClone(originalRequest);
  next.input[0].content[0].text = JSON.stringify({ original: JSON.parse(originalRequest.input[0].content[0].text), retry: correction });
  validateSealedRequest(next, guards);
  return next;
};
const redactRetryEvidence = (value, originalRequest, guards = {}) => {
  const originalEnvelope = JSON.parse(originalRequest.input[0].content[0].text);
  const signals = [
    ...(guards.leakSignals?.signals ?? []).map((item) => item.value),
    ...(originalEnvelope.payload?.identityExclusions?.exactSignals ?? []).filter((item) => String(item).trim().split(/\s+/).length >= 2),
    guards.projectRoot, guards.libraryRoot,
  ].filter(Boolean).sort((left, right) => String(right).length - String(left).length);
  const redactString = (text) => signals.reduce((output, signal) => output.replace(new RegExp(String(signal).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu'), '[REDACTED]'), String(text));
  const visit = (item) => Array.isArray(item) ? item.map(visit) : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, visit(entry)])) : typeof item === 'string' ? redactString(item) : item;
  return visit(value);
};
const postResponses = async (request, options = {}) => {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for sealed API generation.');
  const response = await (options.fetchImpl ?? fetch)('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Sealed Responses API failed (${response.status}): ${body?.error?.message ?? 'unknown API error'}`);
  if (body.status && body.status !== 'completed') throw new Error(`Sealed Responses API returned ${body.status}.`);
  const text = outputText(body);
  if (!text) throw new Error('Sealed Responses API returned no structured output.');
  let parsed; try { parsed = JSON.parse(text); } catch { throw new Error('Sealed Responses API returned invalid JSON.'); }
  return { response: body, output: parsed, returnedModel: body.model ?? null };
};
const materializeOutput = async (output, outputRoot, expectedStillSha256) => {
  if (!output || !Array.isArray(output.files) || output.inspection?.stillSha256 !== expectedStillSha256) throw new Error('Structured output does not prove inspection of the staged still.');
  await rm(outputRoot, { recursive: true, force: true }); await mkdir(outputRoot, { recursive: true });
  for (const file of output.files) {
    if (!/^(?:index\.html|styles\.css|script\.js|assets\/[A-Za-z0-9._/-]+)$/.test(file.path) || file.path.includes('..')) throw new Error(`Structured output contains an invalid path: ${file.path}`);
    const destination = resolve(outputRoot, file.path); assertContainedPath(destination, outputRoot); await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, file.content, 'utf8');
  }
  if (!existsSync(resolve(outputRoot, 'index.html'))) throw new Error('Structured output is missing index.html.');
};
const runSealedGeneration = async (payload, stillPath, outputRoot, options = {}) => {
  const original = await buildSealedRequest(payload, stillPath, options.guards); let request = original; let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await postResponses(request, options); await materializeOutput(result.output, outputRoot, payload.reference.sha256);
    try {
      const validation = options.validateAttempt ? await options.validateAttempt(outputRoot, { attempt, result }) : null;
      return { isolationMode: 'sealed-api', developmentModelOverride: request.model !== RELEASE_MODEL, attempt: attempt + 1, requestedModel: request.model, returnedModel: result.returnedModel, validation, response: result.response };
    } catch (error) {
      lastError = error; if (attempt === 2) break;
      const suppliedEvidence = options.retryEvidence ? await options.retryEvidence(outputRoot, error) : { previousFiles: result.output.files, failures: [error.message] };
      const retryEvidence = redactRetryEvidence(suppliedEvidence, original, options.guards);
      request = buildRetryRequest(original, retryEvidence, options.guards);
    }
  }
  throw new Error(`Sealed generation failed after three attempts: ${lastError?.message ?? 'validation failed'}`);
};
const createDegradedApproval = ({ acknowledged, action, approver, generationId, degradedCause, reason }) => {
  if (acknowledged !== DEGRADED_WARNING || action !== DEGRADED_ACTION) throw new Error('Degraded generation requires the exact warning acknowledgement and explicit action.');
  if (!approver?.trim() || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(generationId ?? '')) throw new Error('Degraded approval requires an approver and valid generation ID.');
  if (!['api-unavailable', 'sealed-api-failure'].includes(degradedCause)) throw new Error('Degraded generation is available only after unavailable API configuration or a sealed API failure.');
  return { mode: 'degraded', isolationMode: 'degraded', isolated: false, warning: DEGRADED_WARNING, action: DEGRADED_ACTION, approver, generationId, degradedCause, reason: reason ?? degradedCause, approvedAt: new Date().toISOString(), explicitApproval: true };
};

const main = async () => {
  const [command, first, second, third] = process.argv.slice(2);
  if (command === 'build-request' && first && second) { const payload = JSON.parse(await readFile(resolve(first), 'utf8')); console.log(JSON.stringify(await buildSealedRequest(payload, resolve(second)), null, 2)); return; }
  if (command === 'run' && first && second && third) { const payload = JSON.parse(await readFile(resolve(first), 'utf8')); console.log(JSON.stringify(await runSealedGeneration(payload, resolve(second), resolve(third)), null, 2)); return; }
  throw new Error('Usage: isolation-runner.mjs build-request <payload.json> <still> | run <payload.json> <still> <output-root>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Isolation runner: ${error.message}`); process.exitCode = 1; });

export { DEGRADED_ACTION, DEGRADED_WARNING, RELEASE_MODEL, buildRetryRequest, buildSealedRequest, createDegradedApproval, materializeOutput, outputSchema, postResponses, redactRetryEvidence, runSealedGeneration, validateIdentityPlacement, validateSealedRequest };
