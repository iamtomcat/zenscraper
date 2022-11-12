import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";

import { redis } from "./upstash";

export const deleteAndAddItemsToLeaderboard = (
  leaderboard: string,
  scores: ScoreMember<string>[]
) => {
  const pipeline = redis.pipeline();

  pipeline.del(leaderboard);

  const scoreSlice = scores.slice(1);
  pipeline.zadd<string>(leaderboard, scores[0], ...scoreSlice);

  return pipeline.exec();
};