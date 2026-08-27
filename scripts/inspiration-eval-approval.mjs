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
  if (approval.evaluationFingerprint !== current.evaluationFingerprint || approval.decision !== 'approved') throw new Error('Inspiration-eval approval is stale or not approved.');
  if (approval.requestedModel !== current.inputs.releaseModel || approval.returnedModels?.some((model) => model !== current.inputs.releaseModel)) throw new Error('Approval does not attest the pinned release model.');
  if (hash(approval.cardFingerprints) !== hash(current.inputs.cardFingerprints) || hash(approval.identityReviewBandFingerprints) !== hash(current.inputs.identityReviewBandFingerprints) || hash(approval.inputFingerprints) !== hash(current.inputs.fileFingerprints) || approval.goldenFixtureFingerprint !== current.inputs.goldenFixtureFingerprint) throw new Error('Inspiration-eval approval inputs are stale.');
  return true;
};
const approve = async ({ reportPath, reviewer }) => {
  if (!reportPath || !reviewer?.trim()) throw new Error('Usage: npm run approve:inspiration-eval -- --report <report.json> --reviewer <name>');
  const report = await readJson(resolve(reportPath));
  const current = await currentEvaluationInputs();
  if (!report.machinePassed || report.evaluationFingerprint !== current.evaluationFingerprint) throw new Error('The evaluation did not pass or its fingerprint is stale.');
  if (report.requestedModel !== current.inputs.releaseModel || report.returnedModels?.some((model) => model !== current.inputs.releaseModel)) throw new Error('The evaluation did not exclusively use the pinned release model.');
  const artifact = {
    schemaVersion: 1,
    evaluationFingerprint: current.evaluationFingerprint,
    reportHash: hash(report),
    artifactManifestHash: hash(report.artifactManifest),
    cardFingerprints: current.inputs.cardFingerprints,
    identityReviewBandFingerprints: current.inputs.identityReviewBandFingerprints,
    inputFingerprints: current.inputs.fileFingerprints,
    goldenFixtureFingerprint: current.inputs.goldenFixtureFingerprint,
    frozenContractFingerprints: report.frozenContractFingerprints,
    requestedModel: report.requestedModel,
    returnedModels: report.returnedModels,
    machineScores: report.machineScores,
    evaluatorScores: report.evaluatorScores,
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
