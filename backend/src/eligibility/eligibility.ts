import type {
  Channel,
  CustomerProfile,
  DecisionContext,
  EligibilityRuleSpec,
} from "../domain/types.js";

export interface EligibilityInput {
  profile: CustomerProfile;
  channel: Channel;
  context?: DecisionContext;
}

export function isEligible(
  spec: EligibilityRuleSpec,
  input: EligibilityInput,
): boolean {
  const { profile, channel } = input;

  if (spec.channels?.length && !spec.channels.includes(channel)) {
    return false;
  }

  if (
    spec.requireAccountStatus?.length &&
    !spec.requireAccountStatus.includes(profile.accountStatus)
  ) {
    return false;
  }

  if (spec.requireSegment?.length && !spec.requireSegment.includes(profile.segment)) {
    return false;
  }

  if (
    spec.minTenureDays !== undefined &&
    profile.tenureDays < spec.minTenureDays
  ) {
    return false;
  }

  if (spec.requireProductFamily?.length) {
    const hasFamily = spec.requireProductFamily.some((f) =>
      profile.eligibleProductFamilies.includes(f),
    );
    if (!hasFamily) return false;
  }

  if (spec.requireFeature) {
    for (const [key, expected] of Object.entries(spec.requireFeature)) {
      if (profile.features[key] !== expected) return false;
    }
  }

  return true;
}

export function filterEligible<T extends { eligibility: EligibilityRuleSpec }>(
  items: T[],
  input: EligibilityInput,
): T[] {
  return items.filter((item) => isEligible(item.eligibility, input));
}
