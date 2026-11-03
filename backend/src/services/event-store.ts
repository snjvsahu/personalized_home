import { randomUUID } from "node:crypto";
import type { AnalyticsEvent } from "../domain/types.js";

export interface EventStore {
  append(event: AnalyticsEvent): AnalyticsEvent;
  list(limit?: number): AnalyticsEvent[];
}

/** In-memory event log for impressions/clicks (training data export TBD). */
export class InMemoryEventStore implements EventStore {
  private events: AnalyticsEvent[] = [];

  append(event: AnalyticsEvent): AnalyticsEvent {
    const stored: AnalyticsEvent = {
      ...event,
      eventId: event.eventId ?? randomUUID(),
      occurredAt: event.occurredAt ?? new Date().toISOString(),
    };
    this.events.push(stored);
    return stored;
  }

  list(limit = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }
}
