import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import VerificationBadge, { VerificationLegend } from "./VerificationBadge";

afterEach(cleanup);

describe("VerificationBadge", () => {
  it("explains a derived assumption accessibly", () => {
    render(<VerificationBadge status="derived_assumption" />);
    expect(screen.getByText("Derived assumption")).toBeTruthy();
    expect(screen.getByLabelText(/inferred rule/i)).toBeTruthy();
  });

  it("renders all five shared evidence states", () => {
    render(<VerificationLegend />);
    for (const label of ["Official", "Client datamined", "Client verified", "Community verified", "Derived assumption"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});
