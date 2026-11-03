export const decisionRequestBodySchema = {
  type: "object",
  required: ["customerId", "lob", "channel"],
  properties: {
    customerId: { type: "string" },
    lob: { type: "string", enum: ["prepaid", "postpaid", "fixed"] },
    channel: { type: "string", enum: ["mobile_app", "web", "ussd"] },
    context: {
      type: "object",
      additionalProperties: true,
      properties: {
        locale: { type: "string" },
        appVersion: { type: "string" },
        screen: { type: "string", enum: ["home", "self_care_home"] },
      },
    },
  },
} as const;

export const quickLinkConfigBodySchema = {
  type: "object",
  required: ["maxSlots", "links"],
  properties: {
    maxSlots: { type: "integer", minimum: 1, maximum: 8 },
    links: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "label", "deepLink"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          icon: { type: "string" },
          deepLink: { type: "string" },
          priority: { type: "integer" },
          enabled: { type: "boolean" },
          eligibility: { type: "object", additionalProperties: true },
        },
      },
    },
  },
} as const;

export const analyticsEventsBodySchema = {
  type: "object",
  required: ["events"],
  properties: {
    events: {
      type: "array",
      minItems: 1,
      maxItems: 100,
      items: {
        type: "object",
        required: [
          "eventType",
          "trackingId",
          "decisionId",
          "customerId",
          "slotType",
          "contentId",
        ],
        properties: {
          eventType: { type: "string", enum: ["impression", "click"] },
          trackingId: { type: "string", format: "uuid" },
          decisionId: { type: "string", format: "uuid" },
          customerId: { type: "string" },
          slotType: {
            type: "string",
            enum: ["hero_banner", "notification", "quick_link"],
          },
          contentId: { type: "string" },
          occurredAt: { type: "string", format: "date-time" },
          metadata: { type: "object", additionalProperties: true },
        },
      },
    },
  },
} as const;
