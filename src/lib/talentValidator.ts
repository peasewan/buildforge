import type { TalentDataset } from "../data/datasets";

export interface ValidationError {
  id: string;
  message: string;
}

// Cheap correctness gate to run before publishing a beta dataset. It catches the
// mistakes that matter on launch day: duplicate ids, missing sources, invalid
// ranks, and prerequisites that point at talents that do not exist.
export function validateTalentDataset(dataset: TalentDataset): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (const talent of dataset.talents) {
    if (seenIds.has(talent.id)) {
      errors.push({ id: talent.id, message: "Duplicate talent id" });
    }
    seenIds.add(talent.id);

    if (!Number.isInteger(talent.maxRank) || talent.maxRank <= 0) {
      errors.push({ id: talent.id, message: "Invalid maxRank" });
    }

    if (!Number.isInteger(talent.requiredTreePoints) || talent.requiredTreePoints < 0) {
      errors.push({ id: talent.id, message: "Invalid requiredTreePoints" });
    }

    if (!talent.sources || talent.sources.length === 0) {
      errors.push({ id: talent.id, message: "Missing source" });
    }

    if (!talent.verification || !talent.verification.name) {
      errors.push({ id: talent.id, message: "Missing verification status" });
    }

    for (const prerequisiteId of talent.prerequisite ?? []) {
      if (!dataset.talents.some((candidate) => candidate.id === prerequisiteId)) {
        errors.push({ id: talent.id, message: `Prerequisite points to missing talent: ${prerequisiteId}` });
      }
    }
  }

  return errors;
}
