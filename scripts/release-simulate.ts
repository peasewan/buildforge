import { readFileSync } from "node:fs";
import { betaDataset } from "../src/data/datasets";
import { simulateTalentRelease } from "../src/lib/releaseSimulation";

const protectedFiles = ["vercel.json", "public/sitemap.xml", "src/lib/routes.ts"];
const before = new Map(protectedFiles.map((path) => [path, readFileSync(path, "utf8")]));

const candidate = structuredClone(betaDataset);
candidate.sourceVersion = "wow_forever_beta_1.60.1.69920";
candidate.label = "WoW Forever Beta · 1.60.1.69920 simulation";
candidate.talents[0].rankDescriptions![0] += " [simulation]";
const valid = simulateTalentRelease(betaDataset, candidate);
if (!valid.ok || !valid.draft?.entries.some((entry) => entry.type === "tooltip_changed")) {
  throw new Error("Valid 69900 simulation did not produce the expected tooltip diff");
}

const invalid = structuredClone(candidate);
invalid.talents[1].id = invalid.talents[0].id;
if (simulateTalentRelease(betaDataset, invalid).ok) throw new Error("Invalid candidate was not blocked");

for (const path of protectedFiles) {
  if (readFileSync(path, "utf8") !== before.get(path)) throw new Error(`Simulation modified protected SEO file: ${path}`);
}
console.log(`✓ 69920 candidate triggered ${valid.draft.entries.length} reviewed draft change`);
console.log("✓ invalid candidate blocked before promotion");
console.log("✓ title/canonical/route/sitemap inputs unchanged");

