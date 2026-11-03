import { randomUUID } from "node:crypto";
import type { ContentStore } from "../content/content-store.js";
import type {
  DecisionRequest,
  DecisionResponse,
  DecisionSlot,
  HeroBannerPayload,
  QuickLinkPayload,
  RankableItem,
  SlotType,
} from "../domain/types.js";
import { filterEligible } from "../eligibility/eligibility.js";
import type { CustomerProfileProvider } from "../profile/mock-profile-provider.js";
import type { Ranker } from "../ranking/ranker.js";

export class DecisionService {
  constructor(
    private readonly content: ContentStore,
    private readonly profiles: CustomerProfileProvider,
    private readonly ranker: Ranker,
  ) {}

  async decide(request: DecisionRequest): Promise<DecisionResponse> {
    const decisionId = randomUUID();
    const generatedAt = new Date().toISOString();
    const profile = await this.profiles.getProfile(
      request.customerId,
      request.lob,
    );

    const eligibilityInput = {
      profile,
      channel: request.channel,
      context: request.context,
    };

    const offersForLob = this.content
      .listOffers()
      .filter((o) => o.lob.includes(request.lob));
    const eligibleOffers = filterEligible(offersForLob, eligibilityInput);

    const notificationsForLob = this.content
      .listNotifications()
      .filter((n) => n.lob.includes(request.lob));
    const eligibleNotifications = filterEligible(
      notificationsForLob,
      eligibilityInput,
    );

    const qlConfig = this.content.getQuickLinkConfig(request.lob);
    const enabledLinks = (qlConfig?.links ?? []).filter((l) => l.enabled);
    const eligibleLinks = filterEligible(enabledLinks, eligibilityInput);

    const heroCandidates: RankableItem[] = eligibleOffers
      .filter((o) => o.hero)
      .map((o) => ({
        contentId: o.id,
        slotType: "hero_banner" as SlotType,
        priority: o.priority,
        payload: {
          ...o.hero!,
          offerId: o.id,
        } satisfies HeroBannerPayload,
      }));

    const notificationCandidates: RankableItem[] = eligibleNotifications.map(
      (n) => ({
        contentId: n.id,
        slotType: "notification" as SlotType,
        priority: n.priority,
        payload: { ...n.payload },
      }),
    );

    const quickLinkCandidates: RankableItem[] = eligibleLinks.map((l) => ({
      contentId: l.id,
      slotType: "quick_link" as SlotType,
      priority: l.priority,
      payload: {
        label: l.label,
        icon: l.icon,
        deepLink: l.deepLink,
        quickLinkId: l.id,
      } satisfies QuickLinkPayload,
    }));

    const rankedHero = this.ranker.rank(heroCandidates);
    const rankedNotifications = this.ranker.rank(notificationCandidates);
    const rankedQuickLinks = this.ranker.rank(quickLinkCandidates);

    const maxQuick = qlConfig?.maxSlots ?? 8;
    const selectedQuick = rankedQuickLinks.slice(0, maxQuick);

    const slots: DecisionSlot[] = [];
    let rank = 0;

    const pushSlot = (item: RankableItem) => {
      const trackingId = randomUUID();
      slots.push({
        slotType: item.slotType,
        payload: item.payload,
        tracking: {
          trackingId,
          contentId: item.contentId,
          slotType: item.slotType,
          rank,
          decisionId,
        },
      });
      rank += 1;
    };

    if (rankedHero[0]) pushSlot(rankedHero[0]);
    if (rankedNotifications[0]) pushSlot(rankedNotifications[0]);
    for (const ql of selectedQuick) pushSlot(ql);

    return {
      decisionId,
      customerId: request.customerId,
      lob: request.lob,
      channel: request.channel,
      generatedAt,
      slots,
    };
  }
}
