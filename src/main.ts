import { ScoreMember } from "@upstash/redis/types/pkg/commands/zadd";
import {
  endOfMonth,
  endOfToday,
  format,
  startOfMonth,
  startOfToday,
  subDays,
} from "date-fns";

import { scraper } from "./scrape";
import {
  addToUserHistoricalData,
  getUserHistoryScores,
  getUserHistoryKeys,
  UserHistoryData,
  incrementLeaderboardItems,
} from "./upstash";

const scrape = false;

const main = async () => {
  const date = startOfToday();
  let statsForDay: { [userName: string]: number } = {};

  if (scrape) {
    statsForDay = await scraper(date);
  }

  console.log("poop", statsForDay);

  // 1: update hash for eash user
  await updateUserData(date, statsForDay);

  // 2: rebuild 30 day leaderboard
  await rebuild30DayLeaderboard();

  // 3: Add value for monthly leaderboard
  await setupMonthlyLeaderboard();
};

const updateUserData = async (
  date: Date,
  statsForDay: { [userName: string]: number }
) => {
  if (Object.keys(statsForDay).length > 0) {
    const historicalData = Object.entries(statsForDay).map(([name, score]) => {
      return {
        name,
        score,
      } as UserHistoryData;
    });

    await addToUserHistoricalData(date, historicalData);
  }
};

const rebuild30DayLeaderboard = async () => {
  const historyKeys = await getUserHistoryKeys();

  console.log("keys", historyKeys);

  const today = endOfToday();
  const thirtyDaysAgo = subDays(today, 30);

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    thirtyDaysAgo,
    today
  );

  console.log("stuff", items);

  incrementLeaderboardItems("leaderboard:30day", items);
};

const setupMonthlyLeaderboard = async () => {
  const historyKeys = await getUserHistoryKeys();

  console.log("keys", historyKeys);

  const today = new Date();

  const endOfCurrentMonth = endOfMonth(today);
  const startOfCurrentMonth = startOfMonth(today);

  const items: ScoreMember<string>[] = await extractHistoryBetweenDates(
    historyKeys,
    startOfCurrentMonth,
    endOfCurrentMonth
  );

  console.log("stuff", items);

  const monthYearName = format(today, "yyyy:MMM");

  incrementLeaderboardItems(`leaderboard:${monthYearName}`, items);
};

const extractHistoryBetweenDates = async (
  historyKeys: string[],
  startDate: Date,
  endDate: Date
) => {
  const items: ScoreMember<string>[] = [];

  for (const key of historyKeys) {
    const userHistoryScores = await getUserHistoryScores(
      key,
      startDate,
      endDate
    );

    console.log("scores", userHistoryScores);

    let totalScore = 0;
    let name = "";
    for (const score of userHistoryScores) {
      totalScore += score.score;
      if (name === "") {
        name = score.name;
      }
    }

    if (name !== "") {
      items.push({ member: name, score: totalScore });
    }
  }

  return items;
}

main().then(() => {});
