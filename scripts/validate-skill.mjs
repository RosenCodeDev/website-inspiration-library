#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyVendorInventory } from './skill-integrity.mjs';

const root = resolve(import.meta.dirname, '..');
const skillRoot = resolve(root, 'skills', 'design-taste-injection');
const required = [
  'SKILL.md', 'agents/openai.yaml', 'assets/workbench-template.html', 'references/clone-remix.md',
  'references/workbench.md', 'scripts/browser-discovery.mjs', 'scripts/clone-runtime.mjs',
  'scripts/path-safety.mjs', 'scripts/project-state.mjs', 'scripts/reference-selection.mjs', 'scripts/reference-review.mjs', 'scripts/rotation-ledger.mjs',
  'scripts/visual-contract.mjs', 'scripts/isolation-runner.mjs', 'scripts/serve-workbench.mjs',
];

const validateSkill = async () => {
  const missing = required.filter((path) => !existsSync(resolve(skillRoot, path)));
  if (missing.length) throw new Error(`Missing skill files: ${missing.join(', ')}`);
  const skill = await readFile(resolve(skillRoot, 'SKILL.md'), 'utf8');
  if (!/^---\s*[\s\S]*?name:\s*design-taste-injection\s*[\s\S]*?---/m.test(skill)) throw new Error('SKILL.md frontmatter is invalid.');
  if (!skill.includes('$design-taste-injection')) throw new Error('SKILL.md must document its explicit invocation.');
  const links = [...skill.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)].map((match) => match[1]);
  const broken = links.filter((link) => !existsSync(resolve(skillRoot, link)));
  if (broken.length) throw new Error(`Broken local SKILL.md links: ${broken.join(', ')}`);
  const vendor = await verifyVendorInventory(resolve(skillRoot, 'vendor', 'site-clone'));
  return { skill: 'design-taste-injection', requiredFiles: required.length, vendorFiles: vendor.fileCount, vendorCommit: vendor.upstreamCommit };
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) validateSkill().then((result) => console.log(`Valid skill: ${result.skill}; ${result.requiredFiles} maintained files; vendor ${result.vendorCommit} (${result.vendorFiles} files).`))
  .catch((error) => { console.error(`Skill validation failed: ${error.message}`); process.exitCode = 1; });

export { validateSkill };
