import { z } from "zod";

export const lineOfBusinessSchema = z.enum(["prepaid", "postpaid", "fixed"]);
export const channelSchema = z.enum(["mobile_app", "web", "ussd"]);
export const slotTypeSchema = z.enum(["hero_banner", "notification", "quick_link"]);
export const eventTypeSchema = z.enum(["impression", "click"]);

export const decisionRequestSchema = z.object({
  customerId: z.string().min(1),
  lob: lineOfBusinessSchema,
  channel: channelSchema,
  context: z
    .object({
      locale: z.string().optional(),
      appVersion: z.string().optional(),
      screen: z.enum(["home", "self_care_home"]).optional(),
    })
    .passthrough()
    .optional(),
});

export const eligibilityRuleSchema = z.object({
  requireAccountStatus: z.array(z.enum(["active", "suspended", "pending"])).optional(),
  requireSegment: z.array(z.string()).optional(),
  requireFeature: z.record(z.union([z.boolean(), z.number(), z.string()])).optional(),
  requireProductFamily: z.array(z.string()).optional(),
  minTenureDays: z.number().int().nonnegative().optional(),
  channels: z.array(channelSchema).optional(),
});

export const quickLinkDefinitionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().optional(),
  deepLink: z.string().min(1),
  priority: z.number().int().default(0),
  enabled: z.boolean().default(true),
  eligibility: eligibilityRuleSchema.default({}),
});

export const lobQuickLinkConfigSchema = z.object({
  lob: lineOfBusinessSchema,
  maxSlots: z.number().int().min(1).max(8),
  links: z.array(quickLinkDefinitionSchema),
});

export const analyticsEventSchema = z.object({
  eventType: eventTypeSchema,
  trackingId: z.string().uuid(),
  decisionId: z.string().uuid(),
  customerId: z.string().min(1),
  slotType: slotTypeSchema,
  contentId: z.string().min(1),
  occurredAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const analyticsEventsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(100),
});
