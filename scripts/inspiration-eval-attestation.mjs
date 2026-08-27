#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { artifactManifest, currentEvaluationInputs, hash, root } from './inspiration-eval-common.mjs';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const evaluationRoot = (fingerprint) => resolve(root, '.inspiration-eval', `subscription-${fingerprint.slice(0, 16)}`);
const validateAttestation = (attestation, current, evidence) => {
  if (attestation.schemaVersion !== 3 || attestation.evaluationMode !== 'subscription' || attestation.evaluationFingerprint !== current.evaluationFingerprint || attestation.machinePassed !== true) throw new Error('Subscription inspiration-eval attestation is stale, from the wrong mode, or did not pass.');
  if (!Number.isFinite(Date.parse(attestation.createdAt)) || !/^[a-f0-9]{64}$/.test(attestation.reportHash ?? '') || !/^[a-f0-9]{64}$/.test(attestation.artifactManifestHash ?? '')) throw new Error('Subscription inspiration-eval attestation is malformed.');
  if (!Number.isFinite(attestation.rubricMean) || attestation.rubricMean < 4 || !Number.isInteger(attestation.rubricMinimum) || attestation.rubricMinimum < 3) throw new Error('Subscription inspiration-eval visual smoke threshold was not met.');
  if (hash(attestation.cardFingerprints) !== hash(current.inputs.cardFingerprints)
    || hash(attestation.identityReviewBandFingerprints) !== hash(current.inputs.identityReviewBandFingerprints)
    || hash(attestation.identityReviewOrigins) !== hash(current.inputs.identityReviewOrigins)
    || hash(attestation.inputFingerprints) !== hash(current.inputs.fileFingerprints)
    || attestation.skillFingerprint !== current.inputs.skillFingerprint
    || attestation.goldenFixtureFingerprint !== current.inputs.goldenFixtureFingerprint) throw new Error('Inspiration-eval attestation inputs are stale.');
  if (evidence) {
    if (hash(evidence.report) !== attestation.reportHash || hash(evidence.artifactManifest) !== attestation.artifactManifestHash) throw new Error('Inspiration-eval report or artifacts were modified after attestation.');
    if (hash(evidence.report.artifactManifest) !== hash(evidence.artifactManifest)) throw new Error('Inspiration-eval report carries a stale artifact manifest.');
    if (evidence.report.releaseEligible !== true || evidence.report.rubric?.mean !== attestation.rubricMean || evidence.report.rubric?.minimum !== attestation.rubricMinimum) throw new Error('Inspiration-eval report is not release eligible or does not match its attestation.');
  }
  return true;
};
const writeAttestation = async (reportPath) => {
  const path = resolve(reportPath); const report = await readJson(path); const current = await currentEvaluationInputs(); const directory = evaluationRoot(current.evaluationFingerprint);
  if (path !== resolve(directory, 'report.json')) throw new Error('Attestation must be written for the current deterministic subscription evaluation directory.');
  const manifest = await artifactManifest(directory);
  if (report.evaluationMode !== 'subscription' || report.evaluationFingerprint !== current.evaluationFingerprint || report.machinePassed !== true || report.releaseEligible !== true) throw new Error('Only the current passing subscription report can produce a release attestation.');
  const attestation = {
    schemaVersion: 3, evaluationMode: 'subscription', evaluationFingerprint: current.evaluationFingerprint,
    machinePassed: true, createdAt: new Date().toISOString(), reportHash: hash(report), artifactManifestHash: hash(manifest),
    rubricMean: report.rubric.mean, rubricMinimum: report.rubric.minimum,
    cardFingerprints: current.inputs.cardFingerprints, identityReviewBandFingerprints: current.inputs.identityReviewBandFingerprints,
    identityReviewOrigins: current.inputs.identityReviewOrigins, inputFingerprints: current.inputs.fileFingerprints,
    skillFingerprint: current.inputs.skillFingerprint, goldenFixtureFingerprint: current.inputs.goldenFixtureFingerprint,
    subscriptionRunner: current.inputs.subscriptionRunner, imageProvider: current.inputs.imageProvider,
  };
  validateAttestation(attestation, current, { report, artifactManifest: manifest });
  const destination = resolve(directory, 'attestation.json'); await writeFile(destination, `${JSON.stringify(attestation, null, 2)}\n`, 'utf8');
  return { destination, attestation };
};
const check = async () => {
  const current = await currentEvaluationInputs(); const directory = evaluationRoot(current.evaluationFingerprint);
  const path = resolve(directory, 'attestation.json'); const reportPath = resolve(directory, 'report.json');
  if (!existsSync(path) || !existsSync(reportPath)) throw new Error(`Missing current inspiration-eval report or attestation under: ${directory}`);
  const [attestation, report, manifest] = await Promise.all([readJson(path), readJson(reportPath), artifactManifest(directory)]);
  validateAttestation(attestation, current, { report, artifactManifest: manifest });
  return { passed: true, path, reportPath, evaluationFingerprint: current.evaluationFingerprint, rubricMean: attestation.rubricMean };
};
const main = async () => {
  const result = process.argv[2] === 'check' ? await check() : (() => { throw new Error('Usage: inspiration-eval-attestation.mjs check'); })();
  console.log(JSON.stringify(result, null, 2));
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Inspiration evaluation attestation: ${error.message}`); process.exitCode = 1; });

export { check, evaluationRoot, validateAttestation, writeAttestation };
