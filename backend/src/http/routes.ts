import type { FastifyInstance } from "fastify";
import type { ContentStore } from "../content/content-store.js";
import type { LineOfBusiness } from "../domain/types.js";
import {
  analyticsEventsBodySchema,
  decisionRequestBodySchema,
  quickLinkConfigBodySchema,
} from "../http/openapi-schemas.js";
import {
  analyticsEventSchema,
  analyticsEventsBatchSchema,
  decisionRequestSchema,
  lobQuickLinkConfigSchema,
} from "../http/schemas.js";
import type { DecisionService } from "../services/decision-service.js";
import type { EventStore } from "../services/event-store.js";

export function registerRoutes(
  app: FastifyInstance,
  deps: {
    decisionService: DecisionService;
    contentStore: ContentStore;
    eventStore: EventStore;
  },
): void {
  app.post(
    "/v1/decisions",
    {
      schema: {
        tags: ["Decisions"],
        summary: "Personalized home / self-care slot ordering",
        body: decisionRequestBodySchema,
        response: {
          200: {
            type: "object",
            properties: {
              decisionId: { type: "string", format: "uuid" },
              customerId: { type: "string" },
              lob: { type: "string" },
              channel: { type: "string" },
              generatedAt: { type: "string" },
              slots: { type: "array" },
            },
          },
        },
      },
    },
    async (request) => {
      const body = decisionRequestSchema.parse(request.body);
      return deps.decisionService.decide(body);
    },
  );

  app.get(
    "/v1/lobs/:lob/quick-links",
    {
      schema: {
        tags: ["Quick links"],
        summary: "Read quick-link grid config for a LOB",
        params: {
          type: "object",
          properties: { lob: { type: "string", enum: ["prepaid", "postpaid", "fixed"] } },
          required: ["lob"],
        },
      },
    },
    async (request, reply) => {
      const lob = (request.params as { lob: LineOfBusiness }).lob;
      const config = deps.contentStore.getQuickLinkConfig(lob);
      if (!config) {
        return reply.status(404).send({ error: "LOB not configured", lob });
      }
      return config;
    },
  );

  app.put(
    "/v1/lobs/:lob/quick-links",
    {
      schema: {
        tags: ["Quick links"],
        summary: "Replace quick-link grid config for a LOB (back office)",
        params: {
          type: "object",
          properties: { lob: { type: "string" } },
          required: ["lob"],
        },
        body: quickLinkConfigBodySchema,
      },
    },
    async (request) => {
      const lob = (request.params as { lob: LineOfBusiness }).lob;
      const partial = lobQuickLinkConfigSchema
        .omit({ lob: true })
        .parse(request.body);
      return deps.contentStore.upsertQuickLinkConfig({ lob, ...partial });
    },
  );

  app.get(
    "/v1/quick-links",
    {
      schema: {
        tags: ["Quick links"],
        summary: "List all LOB quick-link configs",
      },
    },
    async () => deps.contentStore.listQuickLinkConfigs(),
  );

  app.post(
    "/v1/events",
    {
      schema: {
        tags: ["Events"],
        summary: "Log impression or click events for model training",
        body: analyticsEventsBodySchema,
      },
    },
    async (request, reply) => {
      const { events } = analyticsEventsBatchSchema.parse(request.body);
      const stored = events.map((e) => {
        analyticsEventSchema.parse(e);
        return deps.eventStore.append(e);
      });
      return reply.status(202).send({ accepted: stored.length, events: stored });
    },
  );

  app.get("/health", async () => ({ status: "ok" }));
}
