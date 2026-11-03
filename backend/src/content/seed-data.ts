import type {
  ContentNotification,
  ContentOffer,
  LobQuickLinkConfig,
} from "../domain/types.js";

/**
 * EXAMPLE DATA ONLY — seeded for local development and tests.
 * Production content should be loaded from a CMS / back-office store.
 */
export const EXAMPLE_OFFERS: ContentOffer[] = [
  {
    id: "offer-prepaid-data-boost",
    _example: true,
    lob: ["prepaid"],
    productFamily: "data_addon",
    title: "Double data weekend",
    priority: 90,
    eligibility: {
      requireAccountStatus: ["active"],
      requireProductFamily: ["data_addon"],
      channels: ["mobile_app", "web"],
    },
    hero: {
      title: "Double your data this weekend",
      subtitle: "Top up ₦500+ to unlock 2× data",
      ctaLabel: "Top up now",
      ctaDeepLink: "app://topup",
      imageUrl: "https://cdn.example.com/heroes/data-boost.png",
    },
  },
  {
    id: "offer-postpaid-roaming",
    _example: true,
    lob: ["postpaid"],
    productFamily: "roaming",
    title: "Roaming pass",
    priority: 80,
    eligibility: {
      requireAccountStatus: ["active"],
      requireSegment: ["premium", "standard"],
      minTenureDays: 30,
    },
    hero: {
      title: "Traveling soon?",
      subtitle: "Add a roaming pass from ₦2,999",
      ctaLabel: "Browse passes",
      ctaDeepLink: "app://roaming",
    },
  },
  {
    id: "offer-fixed-fiber-upgrade",
    _example: true,
    lob: ["fixed"],
    productFamily: "fiber",
    title: "Fiber speed upgrade",
    priority: 85,
    eligibility: {
      requireAccountStatus: ["active"],
      requireFeature: { fiberEligible: true },
    },
    hero: {
      title: "Upgrade to 300 Mbps",
      subtitle: "Same price for 3 months",
      ctaLabel: "Upgrade",
      ctaDeepLink: "app://fixed/upgrade",
    },
  },
];

export const EXAMPLE_NOTIFICATIONS: ContentNotification[] = [
  {
    id: "notif-bill-due",
    _example: true,
    lob: ["postpaid", "fixed"],
    priority: 70,
    eligibility: {
      requireFeature: { billDueWithinDays: 3 },
    },
    payload: {
      title: "Bill due soon",
      body: "Your bill is due in 3 days. Pay now to avoid interruption.",
      severity: "warning",
      dismissible: true,
      deepLink: "app://billing/pay",
    },
  },
  {
    id: "notif-low-balance",
    _example: true,
    lob: ["prepaid"],
    priority: 75,
    eligibility: {
      requireFeature: { lowBalance: true },
    },
    payload: {
      title: "Low balance",
      body: "Your airtime is below ₦100. Recharge to stay connected.",
      severity: "info",
      dismissible: true,
      deepLink: "app://topup",
    },
  },
];

export function buildExampleQuickLinkConfigs(): LobQuickLinkConfig[] {
  return [
    {
      lob: "prepaid",
      maxSlots: 8,
      links: [
        {
          id: "ql-prepaid-topup",
          label: "Top up",
          icon: "wallet",
          deepLink: "app://topup",
          priority: 100,
          enabled: true,
          eligibility: { requireAccountStatus: ["active"] },
        },
        {
          id: "ql-prepaid-data",
          label: "Buy data",
          icon: "signal",
          deepLink: "app://data",
          priority: 90,
          enabled: true,
          eligibility: { requireAccountStatus: ["active"] },
        },
        {
          id: "ql-prepaid-history",
          label: "Usage",
          icon: "chart",
          deepLink: "app://usage",
          priority: 80,
          enabled: true,
          eligibility: {},
        },
        {
          id: "ql-prepaid-support",
          label: "Help",
          icon: "life-ring",
          deepLink: "app://support",
          priority: 10,
          enabled: true,
          eligibility: {},
        },
      ],
    },
    {
      lob: "postpaid",
      maxSlots: 8,
      links: [
        {
          id: "ql-postpaid-bill",
          label: "Pay bill",
          icon: "receipt",
          deepLink: "app://billing/pay",
          priority: 100,
          enabled: true,
          eligibility: { requireAccountStatus: ["active"] },
        },
        {
          id: "ql-postpaid-plan",
          label: "My plan",
          icon: "sim",
          deepLink: "app://plan",
          priority: 95,
          enabled: true,
          eligibility: {},
        },
        {
          id: "ql-postpaid-roaming",
          label: "Roaming",
          icon: "globe",
          deepLink: "app://roaming",
          priority: 70,
          enabled: true,
          eligibility: {
            requireSegment: ["premium", "standard"],
            minTenureDays: 30,
          },
        },
      ],
    },
    {
      lob: "fixed",
      maxSlots: 6,
      links: [
        {
          id: "ql-fixed-outage",
          label: "Outages",
          icon: "alert",
          deepLink: "app://fixed/outages",
          priority: 100,
          enabled: true,
          eligibility: {},
        },
        {
          id: "ql-fixed-upgrade",
          label: "Upgrade speed",
          icon: "rocket",
          deepLink: "app://fixed/upgrade",
          priority: 85,
          enabled: true,
          eligibility: { requireFeature: { fiberEligible: true } },
        },
      ],
    },
  ];
}
