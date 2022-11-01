import { endOfYesterday, subHours } from "date-fns";

import {
  rebuild30DayLeaderboard,
  setupMonthlyLeaderboard,
  buildYesterday,
} from "./leaderboards";
import { scraper } from "./scrape";
import {
  addToUserHistoricalData,
  getUserHistoryKeys,
  UserHistoryData,
} from "./upstash";

const scrape = true;

const ZenPlannerURL =
  "https://raincityathletics.sites.zenplanner.com/workout-leaderboard-daily-results.cfm";

export const main = async () => {
  const date = subHours(endOfYesterday(), 1);

  let statsForDay: { [userName: string]: number } = {};

  if (scrape) {
    statsForDay = await scraper(ZenPlannerURL, date);
  }

  console.log("poop", statsForDay);

  const historyKeys = await getUserHistoryKeys();

  console.log("keys", historyKeys);

  // 1: update hash for eash user
  await updateUserData(date, statsForDay);

  // 2: rebuild 30 day leaderboard
  await rebuild30DayLeaderboard(historyKeys);

  // 3: build yesterday
  await buildYesterday(historyKeys);

  // 4: Add value for monthly leaderboard
  await setupMonthlyLeaderboard(historyKeys);
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
