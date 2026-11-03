import type {
  CustomerProfile,
  DecisionRequest,
  LineOfBusiness,
} from "../domain/types.js";

export interface CustomerProfileProvider {
  getProfile(customerId: string, lob: LineOfBusiness): Promise<CustomerProfile>;
}

/**
 * Mock profile provider — deterministic profiles for demo customers.
 * No real PII; extend with feature flags for tests.
 */
export class MockCustomerProfileProvider implements CustomerProfileProvider {
  async getProfile(
    customerId: string,
    lob: LineOfBusiness,
  ): Promise<CustomerProfile> {
    const presets: Record<string, Partial<CustomerProfile>> = {
      "cust-prepaid-active": {
        segment: "mass",
        tenureDays: 120,
        accountStatus: "active",
        eligibleProductFamilies: ["data_addon"],
        features: { lowBalance: true },
      },
      "cust-postpaid-premium": {
        segment: "premium",
        tenureDays: 400,
        accountStatus: "active",
        eligibleProductFamilies: ["roaming", "device"],
        features: { billDueWithinDays: 3 },
      },
      "cust-fixed-fiber": {
        segment: "standard",
        tenureDays: 200,
        accountStatus: "active",
        eligibleProductFamilies: ["fiber"],
        features: { fiberEligible: true },
      },
      "cust-suspended": {
        segment: "mass",
        tenureDays: 10,
        accountStatus: "suspended",
        eligibleProductFamilies: [],
        features: {},
      },
    };

    const base = presets[customerId];
    return {
      customerId,
      lob,
      segment: base?.segment ?? "standard",
      tenureDays: base?.tenureDays ?? 60,
      accountStatus: base?.accountStatus ?? "active",
      eligibleProductFamilies: base?.eligibleProductFamilies ?? ["data_addon"],
      features: base?.features ?? {},
    };
  }
}
