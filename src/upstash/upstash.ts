import { Redis, ScoreMember } from "@upstash/redis";

import { getUnixTime } from "../dates/getUnixTime";
import { userHistoryKey, usersKey } from "./keyBuilder";

export let redis: Redis;

export const setupRedis = () => {
  if (!redis) {
    redis = Redis.fromEnv();
  }
};

export const incrementLeaderboardItems = async (
  leaderboard: string,
  scores: ScoreMember<string>[]
) => {
  for (const score of scores) {
    await redis.zincrby(leaderboard, score.score, score.member);
  }
};

export const deleteKey = async (key: string) => {
  return redis.del(key);
};

export interface UserHistoryData {
  name: string;
  score: number;
  zenDate: string;
}

export const addToUserHistoricalData = async (
  companyName: string,
  date: Date,
  userData: UserHistoryData[]
) => {
  const pipeline = redis.pipeline();

  for (const data of userData) {
    const name = data.name.replace(" ", "-");

    pipeline.zadd<UserHistoryData>(
      userHistoryKey(companyName, name),
      { nx: true },
      { score: getUnixTime(date), member: data }
    );
  }

  return pipeline.exec();
};

export const addUsersToSet = (companyName: string, userNames: string[]) => {
  const key = usersKey(companyName);

  return redis.sadd(key, ...userNames);
};

export const getCurrentUsersList = (companyName: string) => {
  const key = usersKey(companyName);

  return redis.smembers(key);
};

export const getUserHistoryScores = (
  key: string,
  startDate: Date,
  endDate: Date
) => {
  return redis.zrange<UserHistoryData[]>(
    key,
    getUnixTime(endDate),
    getUnixTime(startDate),
    { byScore: true, rev: true }
  );
};
