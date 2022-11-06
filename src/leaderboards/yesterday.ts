import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";
import { endOfYesterday, format, startOfYesterday } from "date-fns";

import { incrementLeaderboardItems } from "../upstash";

import { extractHistoryBetweenDates } from "./extractHistoryBetweenDates";

export const buildYesterday = async (
  companyName: string,
  historyKeys: string[]
) => {
  console.log("Build Yesterday");

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    startOfYesterday(),
    endOfYesterday()
  );

  console.log("stuff", items);

  const yesterdayKey = format(endOfYesterday(), "yyyy:MM:dd");

  incrementLeaderboardItems(`${companyName}leaderboard:${yesterdayKey}`, items);
};
