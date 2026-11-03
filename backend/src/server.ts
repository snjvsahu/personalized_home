import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { InMemoryContentStore } from "./content/content-store.js";
import { registerRoutes } from "./http/routes.js";
import { MockCustomerProfileProvider } from "./profile/mock-profile-provider.js";
import { RulesBasedRanker } from "./ranking/ranker.js";
import { DecisionService } from "./services/decision-service.js";
import { InMemoryEventStore } from "./services/event-store.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Personalized Home Decision API",
        version: "1.0.0",
        description:
          "Telecom self-care personalization: eligibility-first slot filling with pluggable ranking.",
      },
      tags: [
        { name: "Decisions" },
        { name: "Quick links" },
        { name: "Events" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  const contentStore = new InMemoryContentStore();
  const profileProvider = new MockCustomerProfileProvider();
  const ranker = new RulesBasedRanker();
  const decisionService = new DecisionService(
    contentStore,
    profileProvider,
    ranker,
  );
  const eventStore = new InMemoryEventStore();

  registerRoutes(app, { decisionService, contentStore, eventStore });

  return app;
}

async function main() {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen({ port, host });
}

const isMain =
  process.argv[1]?.includes("server") ||
  process.argv[1]?.endsWith("server.ts");

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
