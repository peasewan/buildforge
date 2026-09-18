export type EvidenceStatus =
  | "official"
  | "client_datamined"
  | "client_verified"
  | "community_verified"
  | "derived_assumption";

export const EVIDENCE_STATUS = {
  official: {
    label: "Official",
    description: "Published directly by Blizzard.",
  },
  client_datamined: {
    label: "Client datamined",
    description: "Read from a build-tagged game client export and awaiting independent review.",
  },
  client_verified: {
    label: "Client verified",
    description: "Checked against the identified game client build.",
  },
  community_verified: {
    label: "Community verified",
    description: "Corroborated by multiple public community references.",
  },
  derived_assumption: {
    label: "Derived assumption",
    description: "An inferred rule used where the client does not provide the field directly.",
  },
} satisfies Record<EvidenceStatus, { label: string; description: string }>;

