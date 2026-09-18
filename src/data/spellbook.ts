import type { EvidenceStatus } from "./verification";

export type SpellCategory = "holy" | "protection" | "retribution";
export type SpellChange = "same" | "changed" | "new" | "was_talent";

export interface SpellbookSource {
  type: EvidenceStatus;
  label: string;
  url: string;
  clientBuild: string;
}

export interface SpellbookEntry {
  id: string;
  spellId?: number;
  name: string;
  category: SpellCategory;
  learnedAt: number;
  maxRank: number;
  change: SpellChange;
  verificationStatus: EvidenceStatus;
  sources: SpellbookSource[];
}

export interface SpellbookDataset {
  schemaVersion: 1;
  className: "Paladin";
  clientBuild: string;
  sourceVersion: string;
  reviewedAt: string;
  complete: boolean;
  entries: SpellbookEntry[];
}

export interface RawSpellbook {
  schemaVersion: 1;
  className: "Paladin";
  clientBuild: string;
  sourceVersion: string;
  reviewedAt: string;
  complete: boolean;
  source: SpellbookSource;
  entries: Array<Omit<SpellbookEntry, "sources" | "verificationStatus"> & { verificationStatus?: EvidenceStatus }>;
}

export interface SpellbookValidationError {
  id: string;
  message: string;
}

export function importSpellbook(raw: RawSpellbook): SpellbookDataset {
  return {
    schemaVersion: raw.schemaVersion,
    className: raw.className,
    clientBuild: raw.clientBuild,
    sourceVersion: raw.sourceVersion,
    reviewedAt: raw.reviewedAt,
    complete: raw.complete,
    entries: raw.entries.map((entry) => ({
      ...entry,
      verificationStatus: entry.verificationStatus ?? raw.source.type,
      sources: [raw.source],
    })),
  };
}

export function validateSpellbook(dataset: SpellbookDataset): SpellbookValidationError[] {
  const errors: SpellbookValidationError[] = [];
  const ids = new Set<string>();
  const spellIds = new Set<number>();
  for (const entry of dataset.entries) {
    if (ids.has(entry.id)) errors.push({ id: entry.id, message: "Duplicate spellbook id" });
    ids.add(entry.id);
    if (entry.spellId !== undefined) {
      if (spellIds.has(entry.spellId)) errors.push({ id: entry.id, message: "Duplicate spell id" });
      spellIds.add(entry.spellId);
    }
    if (!entry.name.trim()) errors.push({ id: entry.id, message: "Missing spell name" });
    if (entry.learnedAt < 1 || entry.maxRank < 1) errors.push({ id: entry.id, message: "Invalid level or rank" });
    if (entry.sources.length === 0) errors.push({ id: entry.id, message: "Missing source evidence" });
  }
  if (dataset.complete && dataset.entries.length !== 45) {
    errors.push({ id: "dataset", message: "Complete Paladin trainer spellbook must contain 45 entries" });
  }
  return errors;
}

export function querySpellbook(
  dataset: SpellbookDataset,
  query: { category?: SpellCategory; search?: string; minimumLevel?: number } = {},
): SpellbookEntry[] {
  const search = query.search?.trim().toLocaleLowerCase();
  return dataset.entries.filter((entry) => {
    if (query.category && entry.category !== query.category) return false;
    if (search && !entry.name.toLocaleLowerCase().includes(search)) return false;
    if (query.minimumLevel !== undefined && entry.learnedAt < query.minimumLevel) return false;
    return true;
  });
}
