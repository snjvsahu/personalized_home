import type { RankableItem } from "../domain/types.js";

/** Pluggable ranking (e.g. ML decision-engine) behind a stable interface. */
export interface Ranker {
  rank(items: RankableItem[]): RankableItem[];
}

/**
 * Default ranker: higher priority first, stable tie-break on contentId.
 * Replace binding in DI when wiring an ML model from decision-engine/.
 */
export class RulesBasedRanker implements Ranker {
  rank(items: RankableItem[]): RankableItem[] {
    return [...items].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.contentId.localeCompare(b.contentId);
    });
  }
}
