import type {
  ContentNotification,
  ContentOffer,
  LobQuickLinkConfig,
  LineOfBusiness,
  QuickLinkDefinition,
} from "../domain/types.js";
import {
  EXAMPLE_NOTIFICATIONS,
  EXAMPLE_OFFERS,
  buildExampleQuickLinkConfigs,
} from "./seed-data.js";

export interface ContentStore {
  listOffers(): ContentOffer[];
  listNotifications(): ContentNotification[];
  getQuickLinkConfig(lob: LineOfBusiness): LobQuickLinkConfig | undefined;
  listQuickLinkConfigs(): LobQuickLinkConfig[];
  upsertQuickLinkConfig(config: LobQuickLinkConfig): LobQuickLinkConfig;
}

/** In-memory content store; swap for CMS/back-office integration in production. */
export class InMemoryContentStore implements ContentStore {
  private offers: ContentOffer[];
  private notifications: ContentNotification[];
  private quickLinksByLob: Map<LineOfBusiness, LobQuickLinkConfig>;

  constructor(options?: {
    offers?: ContentOffer[];
    notifications?: ContentNotification[];
    quickLinkConfigs?: LobQuickLinkConfig[];
  }) {
    this.offers = options?.offers ?? [...EXAMPLE_OFFERS];
    this.notifications = options?.notifications ?? [...EXAMPLE_NOTIFICATIONS];
    this.quickLinksByLob = new Map();
    for (const cfg of options?.quickLinkConfigs ?? buildExampleQuickLinkConfigs()) {
      this.quickLinksByLob.set(cfg.lob, structuredClone(cfg));
    }
  }

  listOffers(): ContentOffer[] {
    return this.offers.map((o) => structuredClone(o));
  }

  listNotifications(): ContentNotification[] {
    return this.notifications.map((n) => structuredClone(n));
  }

  getQuickLinkConfig(lob: LineOfBusiness): LobQuickLinkConfig | undefined {
    const cfg = this.quickLinksByLob.get(lob);
    return cfg ? structuredClone(cfg) : undefined;
  }

  listQuickLinkConfigs(): LobQuickLinkConfig[] {
    return [...this.quickLinksByLob.values()].map((c) => structuredClone(c));
  }

  upsertQuickLinkConfig(config: LobQuickLinkConfig): LobQuickLinkConfig {
    const normalized: LobQuickLinkConfig = {
      lob: config.lob,
      maxSlots: Math.min(Math.max(1, config.maxSlots), 8),
      links: config.links.map((l) => normalizeLink(l)),
    };
    this.quickLinksByLob.set(normalized.lob, structuredClone(normalized));
    return this.getQuickLinkConfig(normalized.lob)!;
  }
}

function normalizeLink(link: QuickLinkDefinition): QuickLinkDefinition {
  return {
    ...link,
    enabled: link.enabled !== false,
    priority: link.priority ?? 0,
    eligibility: link.eligibility ?? {},
  };
}
