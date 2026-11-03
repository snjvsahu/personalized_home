import { describe, it, expect } from "vitest";
import { isEligible, filterEligible } from "./eligibility.js";
import type { CustomerProfile, EligibilityRuleSpec } from "../domain/types.js";

const activePrepaid: CustomerProfile = {
  customerId: "x",
  lob: "prepaid",
  segment: "mass",
  tenureDays: 100,
  accountStatus: "active",
  eligibleProductFamilies: ["data_addon"],
  features: { lowBalance: true },
};

describe("eligibility", () => {
  it("rejects when account status does not match", () => {
    const spec: EligibilityRuleSpec = { requireAccountStatus: ["active"] };
    expect(isEligible(spec, { profile: activePrepaid, channel: "mobile_app" })).toBe(
      true,
    );
    expect(
      isEligible(spec, {
        profile: { ...activePrepaid, accountStatus: "suspended" },
        channel: "mobile_app",
      }),
    ).toBe(false);
  });

  it("rejects ineligible product families before ranking would matter", () => {
    const spec: EligibilityRuleSpec = { requireProductFamily: ["roaming"] };
    expect(isEligible(spec, { profile: activePrepaid, channel: "web" })).toBe(
      false,
    );
  });

  it("filterEligible removes items that fail rules", () => {
    const items = [
      { id: "a", eligibility: { requireProductFamily: ["data_addon"] } },
      { id: "b", eligibility: { requireProductFamily: ["roaming"] } },
    ];
    const out = filterEligible(items, {
      profile: activePrepaid,
      channel: "mobile_app",
    });
    expect(out.map((i) => i.id)).toEqual(["a"]);
  });
});
