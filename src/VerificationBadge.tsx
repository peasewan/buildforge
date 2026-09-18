import { EVIDENCE_STATUS, type EvidenceStatus } from "./data/verification";

export default function VerificationBadge({ status }: { status: EvidenceStatus }) {
  const evidence = EVIDENCE_STATUS[status];
  return <span className={`verification-badge verification-${status}`} aria-label={`${evidence.label}: ${evidence.description}`}>{evidence.label}</span>;
}

export function VerificationLegend() {
  return (
    <div className="verification-legend" aria-label="Data verification legend">
      {(Object.keys(EVIDENCE_STATUS) as EvidenceStatus[]).map((status) => <VerificationBadge key={status} status={status} />)}
    </div>
  );
}
