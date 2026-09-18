import { describe, expect, it } from "vitest";
import { betaDataset } from "../data/datasets";
import { simulateTalentRelease } from "./releaseSimulation";

describe("watcher release simulation", () => {
  it("accepts a valid in-memory 69900 candidate and produces a draft", () => {
    const candidate = structuredClone(betaDataset);
    candidate.sourceVersion = "wow_forever_beta_1.60.1.69900";
    candidate.label = "WoW Forever Beta · 1.60.1.69900";
    candidate.talents[0].rankDescriptions![0] += " changed";
    const result = simulateTalentRelease(betaDataset, candidate);
    expect(result.ok).toBe(true);
    expect(result.draft?.entries.some((entry) => entry.type === "tooltip_changed")).toBe(true);
  });

  it("blocks an invalid candidate before promotion", () => {
    const candidate = structuredClone(betaDataset);
    candidate.sourceVersion = "wow_forever_beta_1.60.1.69900";
    candidate.talents[1].id = candidate.talents[0].id;
    const result = simulateTalentRelease(betaDataset, candidate);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.draft).toBeUndefined();
  });
});

