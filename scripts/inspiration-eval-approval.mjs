#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentEvaluationInputs, hash, root } from './inspiration-eval-common.mjs';

const approvalsRoot = resolve(root, 'tests', 'inspiration-eval', 'approvals');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const approvalPath = (fingerprint) => resolve(approvalsRoot, `${fingerprint}.json`);
const validateApproval = (approval, current) => {
  if (approval.schemaVersion !== 2 || approval.evaluationMode !== 'subscription' || approval.evaluationFingerprint !== current.evaluationFingerprint || approval.decision !== 'approved') throw new Error('Subscription inspiration-eval approval is stale, from the wrong mode, or not approved.');
  if (typeof approval.humanReviewer !== 'string' || !approval.humanReviewer.trim() || !Number.isFinite(Date.parse(approval.approvedAt)) || !/^[a-f0-9]{64}$/.test(approval.reportHash ?? '') || !/^[a-f0-9]{64}$/.test(approval.artifactManifestHash ?? '')) throw new Error('Subscription inspiration-eval approval is missing named-review evidence.');
  if (hash(approval.cardFingerprints) !== hash(current.inputs.cardFingerprints) || hash(approval.identityReviewBandFingerprints) !== hash(current.inputs.identityReviewBandFingerprints) || hash(approval.identityReviewOrigins) !== hash(current.inputs.identityReviewOrigins) || hash(approval.inputFingerprints) !== hash(current.inputs.fileFingerprints) || approval.goldenFixtureFingerprint !== current.inputs.goldenFixtureFingerprint) throw new Error('Inspiration-eval approval inputs are stale.');
  return true;
};
const approve = async ({ reportPath, reviewer }) => {
  if (!reportPath || !reviewer?.trim()) throw new Error('Usage: npm run approve:inspiration-eval -- --report <report.json> --reviewer <name>');
  const report = await readJson(resolve(reportPath));
  const current = await currentEvaluationInputs();
  if (!report.machinePassed || report.evaluationMode !== 'subscription' || report.evaluationFingerprint !== current.evaluationFingerprint) throw new Error('The subscription evaluation did not pass or its fingerprint is stale. API benchmark reports cannot satisfy release approval.');
  const artifact = {
    schemaVersion: 2,
    evaluationMode: 'subscription',
    evaluationFingerprint: current.evaluationFingerprint,
    reportHash: hash(report),
    artifactManifestHash: hash(report.artifactManifest),
    cardFingerprints: current.inputs.cardFingerprints,
    identityReviewBandFingerprints: current.inputs.identityReviewBandFingerprints,
    identityReviewOrigins: current.inputs.identityReviewOrigins,
    inputFingerprints: current.inputs.fileFingerprints,
    goldenFixtureFingerprint: current.inputs.goldenFixtureFingerprint,
    frozenContractFingerprints: report.frozenContractFingerprints,
    subscriptionRunner: current.inputs.subscriptionRunner,
    imageProvider: current.inputs.imageProvider,
    machineScores: report.machineScores,
    imageGeneration: report.imageGeneration,
    humanReviewer: reviewer.trim(),
    approvedAt: new Date().toISOString(),
    decision: 'approved',
  };
  await mkdir(approvalsRoot, { recursive: true });
  const destination = approvalPath(current.evaluationFingerprint);
  await writeFile(destination, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  return { destination, artifact };
};
const check = async () => {
  const current = await currentEvaluationInputs(); const path = approvalPath(current.evaluationFingerprint);
  if (!existsSync(path)) throw new Error(`Missing current inspiration-eval approval: ${path}`);
  const approval = await readJson(path);
  validateApproval(approval, current);
  return { approved: true, path, evaluationFingerprint: current.evaluationFingerprint, reviewer: approval.humanReviewer };
};
const argument = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; };
const main = async () => {
  const command = process.argv[2];
  const result = command === 'approve' ? await approve({ reportPath: argument('--report'), reviewer: argument('--reviewer') }) : command === 'check' ? await check() : (() => { throw new Error('Usage: inspiration-eval-approval.mjs approve|check'); })();
  console.log(JSON.stringify(result, null, 2));
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Inspiration evaluation approval: ${error.message}`); process.exitCode = 1; });

export { approve, check, validateApproval };
