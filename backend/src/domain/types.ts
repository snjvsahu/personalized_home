/** Line of business identifiers used across content and decisions. */
export type LineOfBusiness = "prepaid" | "postpaid" | "fixed";

export type Channel = "mobile_app" | "web" | "ussd";

export interface DecisionContext {
  locale?: string;
  appVersion?: string;
  /** Optional session or page hints from the client. */
  screen?: "home" | "self_care_home";
  [key: string]: unknown;
}

export interface DecisionRequest {
  customerId: string;
  lob: LineOfBusiness;
  channel: Channel;
  context?: DecisionContext;
}

export type SlotType = "hero_banner" | "notification" | "quick_link";

export interface TrackingMeta {
  /** Stable id for analytics and model training joins. */
  trackingId: string;
  contentId: string;
  slotType: SlotType;
  rank: number;
  decisionId: string;
}

export interface HeroBannerPayload {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaDeepLink?: string;
  offerId?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  severity: "info" | "warning" | "promo";
  dismissible: boolean;
  deepLink?: string;
}

export interface QuickLinkPayload {
  label: string;
  icon?: string;
  deepLink: string;
  quickLinkId: string;
}

export type SlotPayload =
  | HeroBannerPayload
  | NotificationPayload
  | QuickLinkPayload;

export interface DecisionSlot {
  slotType: SlotType;
  tracking: TrackingMeta;
  payload: SlotPayload;
}

export interface DecisionResponse {
  decisionId: string;
  customerId: string;
  lob: LineOfBusiness;
  channel: Channel;
  generatedAt: string;
  slots: DecisionSlot[];
}

export interface CustomerProfile {
  customerId: string;
  lob: LineOfBusiness;
  segment: string;
  tenureDays: number;
  accountStatus: "active" | "suspended" | "pending";
  features: Record<string, boolean | number | string>;
  eligibleProductFamilies: string[];
}

export interface ContentOffer {
  id: string;
  /** EXAMPLE DATA — replace via back-office integration. */
  _example: true;
  lob: LineOfBusiness[];
  productFamily: string;
  title: string;
  eligibility: EligibilityRuleSpec;
  priority: number;
  hero?: Omit<HeroBannerPayload, "offerId">;
}

export interface ContentNotification {
  id: string;
  _example: true;
  lob: LineOfBusiness[];
  payload: Omit<NotificationPayload, never>;
  eligibility: EligibilityRuleSpec;
  priority: number;
}

export interface QuickLinkDefinition {
  id: string;
  label: string;
  icon?: string;
  deepLink: string;
  eligibility: EligibilityRuleSpec;
  priority: number;
  enabled: boolean;
}

export interface LobQuickLinkConfig {
  lob: LineOfBusiness;
  maxSlots: number;
  links: QuickLinkDefinition[];
}

/** Declarative eligibility spec evaluated against profile + context. */
export interface EligibilityRuleSpec {
  requireAccountStatus?: CustomerProfile["accountStatus"][];
  requireSegment?: string[];
  requireFeature?: Record<string, boolean | number | string>;
  requireProductFamily?: string[];
  minTenureDays?: number;
  channels?: Channel[];
}

export interface RankableItem {
  contentId: string;
  slotType: SlotType;
  priority: number;
  payload: SlotPayload;
}

export type EventType = "impression" | "click";

export interface AnalyticsEvent {
  eventId?: string;
  eventType: EventType;
  trackingId: string;
  decisionId: string;
  customerId: string;
  slotType: SlotType;
  contentId: string;
  occurredAt?: string;
  metadata?: Record<string, unknown>;
}
