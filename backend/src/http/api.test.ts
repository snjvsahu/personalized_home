import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../server.js";
import type { FastifyInstance } from "fastify";

describe("HTTP API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/decisions returns slots with tracking ids", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/decisions",
      payload: {
        customerId: "cust-postpaid-premium",
        lob: "postpaid",
        channel: "web",
        context: { screen: "self_care_home" },
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.slots.length).toBeGreaterThan(0);
    expect(body.slots[0].tracking.trackingId).toBeTruthy();
  });

  it("manages quick-link config per LOB", async () => {
    const getRes = await app.inject({
      method: "GET",
      url: "/v1/lobs/prepaid/quick-links",
    });
    expect(getRes.statusCode).toBe(200);

    const putRes = await app.inject({
      method: "PUT",
      url: "/v1/lobs/prepaid/quick-links",
      payload: {
        maxSlots: 3,
        links: [
          {
            id: "custom-1",
            label: "Custom",
            deepLink: "app://custom",
            priority: 50,
            enabled: true,
            eligibility: {},
          },
        ],
      },
    });
    expect(putRes.statusCode).toBe(200);
    const updated = putRes.json();
    expect(updated.links).toHaveLength(1);
    expect(updated.maxSlots).toBe(3);
  });

  it("POST /v1/events accepts impression and click batches", async () => {
    const decision = await app.inject({
      method: "POST",
      url: "/v1/decisions",
      payload: {
        customerId: "cust-prepaid-active",
        lob: "prepaid",
        channel: "mobile_app",
      },
    });
    const { decisionId, slots } = decision.json();
    const slot = slots[0];

    const eventRes = await app.inject({
      method: "POST",
      url: "/v1/events",
      payload: {
        events: [
          {
            eventType: "impression",
            trackingId: slot.tracking.trackingId,
            decisionId,
            customerId: "cust-prepaid-active",
            slotType: slot.slotType,
            contentId: slot.tracking.contentId,
          },
        ],
      },
    });
    expect(eventRes.statusCode).toBe(202);
    expect(eventRes.json().accepted).toBe(1);
  });
});
