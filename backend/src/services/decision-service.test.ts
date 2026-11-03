import { describe, it, expect } from "vitest";
import { InMemoryContentStore } from "../content/content-store.js";
import { DecisionService } from "./decision-service.js";
import { MockCustomerProfileProvider } from "../profile/mock-profile-provider.js";
import { RulesBasedRanker } from "../ranking/ranker.js";

describe("DecisionService", () => {
  const service = new DecisionService(
    new InMemoryContentStore(),
    new MockCustomerProfileProvider(),
    new RulesBasedRanker(),
  );

  it("returns hero, notification, and quick links for eligible prepaid customer", async () => {
    const res = await service.decide({
      customerId: "cust-prepaid-active",
      lob: "prepaid",
      channel: "mobile_app",
      context: { screen: "home" },
    });

    expect(res.decisionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const types = res.slots.map((s) => s.slotType);
    expect(types[0]).toBe("hero_banner");
    expect(types).toContain("notification");
    expect(types.filter((t) => t === "quick_link").length).toBeGreaterThan(0);
    for (const slot of res.slots) {
      expect(slot.tracking.decisionId).toBe(res.decisionId);
      expect(slot.tracking.trackingId).toBeTruthy();
    }
  });

  it("does not return hero for suspended accounts (eligibility first)", async () => {
    const res = await service.decide({
      customerId: "cust-suspended",
      lob: "prepaid",
      channel: "mobile_app",
    });
    const hero = res.slots.find((s) => s.slotType === "hero_banner");
    expect(hero).toBeUndefined();
  });

  it("respects max quick-link slots per LOB", async () => {
    const store = new InMemoryContentStore();
    store.upsertQuickLinkConfig({
      lob: "prepaid",
      maxSlots: 2,
      links: [
        {
          id: "a",
          label: "A",
          deepLink: "app://a",
          priority: 10,
          enabled: true,
          eligibility: {},
        },
        {
          id: "b",
          label: "B",
          deepLink: "app://b",
          priority: 9,
          enabled: true,
          eligibility: {},
        },
        {
          id: "c",
          label: "C",
          deepLink: "app://c",
          priority: 8,
          enabled: true,
          eligibility: {},
        },
      ],
    });
    const svc = new DecisionService(
      store,
      new MockCustomerProfileProvider(),
      new RulesBasedRanker(),
    );
    const res = await svc.decide({
      customerId: "cust-prepaid-active",
      lob: "prepaid",
      channel: "mobile_app",
    });
    expect(res.slots.filter((s) => s.slotType === "quick_link")).toHaveLength(2);
  });
});
