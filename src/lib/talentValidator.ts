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
  const seenGridPositions = new Set<string>();
  const seenNodeIds = new Set<number>();
  const seenSpellIds = new Set<number>();
  const talentsById = new Map(dataset.talents.map((talent) => [talent.id, talent]));

  for (const talent of dataset.talents) {
    if (seenIds.has(talent.id)) {
      errors.push({ id: talent.id, message: "Duplicate talent id" });
    }
    seenIds.add(talent.id);

    const gridPosition = `${talent.branch}:${talent.row}:${talent.column}`;
    if (seenGridPositions.has(gridPosition)) {
      errors.push({ id: talent.id, message: "Duplicate talent grid position" });
    }
    seenGridPositions.add(gridPosition);

    if (talent.clientNodeId !== undefined) {
      if (seenNodeIds.has(talent.clientNodeId)) errors.push({ id: talent.id, message: "Duplicate clientNodeId" });
      seenNodeIds.add(talent.clientNodeId);
    }

    if (talent.spellId !== undefined) {
      if (seenSpellIds.has(talent.spellId)) errors.push({ id: talent.id, message: "Duplicate spellId" });
      seenSpellIds.add(talent.spellId);
    }

    if (!Number.isInteger(talent.maxRank) || talent.maxRank <= 0) {
      errors.push({ id: talent.id, message: "Invalid maxRank" });
    }

    if (!Number.isInteger(talent.requiredTreePoints) || talent.requiredTreePoints < 0) {
      errors.push({ id: talent.id, message: "Invalid requiredTreePoints" });
    }

    if (talent.rankDescriptions && talent.rankDescriptions.length !== talent.maxRank) {
      errors.push({ id: talent.id, message: "rankDescriptions length does not match maxRank" });
    }

    if (talent.confirmedRanks && (
      talent.confirmedRanks.length !== talent.maxRank
      || talent.confirmedRanks.some((rank, index) => rank !== index + 1)
    )) {
      errors.push({ id: talent.id, message: "confirmedRanks do not cover every rank" });
    }

    if (!talent.sources || talent.sources.length === 0) {
      errors.push({ id: talent.id, message: "Missing source" });
    }

    if (!talent.verification || !talent.verification.name) {
      errors.push({ id: talent.id, message: "Missing verification status" });
    }

    for (const requirement of talent.prerequisite ?? []) {
      const prerequisite = talentsById.get(requirement.talentId);
      if (!prerequisite) {
        errors.push({ id: talent.id, message: `Prerequisite points to missing talent: ${requirement.talentId}` });
      } else if (requirement.requiredRank !== null && (
        !Number.isInteger(requirement.requiredRank)
        || requirement.requiredRank <= 0
        || requirement.requiredRank > prerequisite.maxRank
      )) {
        errors.push({ id: talent.id, message: `Invalid prerequisite rank for: ${requirement.talentId}` });
      }
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const walk = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const talent = talentsById.get(id);
    const cycle = (talent?.prerequisite ?? []).some((requirement) => talentsById.has(requirement.talentId) && walk(requirement.talentId));
    visiting.delete(id);
    visited.add(id);
    return cycle;
  };
  for (const talent of dataset.talents) {
    if (walk(talent.id)) {
      errors.push({ id: talent.id, message: "Prerequisite cycle detected" });
      break;
    }
  }

  return errors;
}
