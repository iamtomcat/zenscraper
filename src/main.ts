import { isEqual } from "date-fns";
import { getInstanceOfDateAtMidnight } from "./dates/dateAtMidnight";
import { getZeroedMinutesAndSeconds } from "./dates/zeroMinutesSeconds";

import {
  rebuild30DayLeaderboard,
  setupMonthlyLeaderboard,
  buildYesterday,
  buildTodayLeaderBoard,
} from "./leaderboards";
import { scraper, SummedUserScore } from "./scrape";
import {
  addToUserHistoricalData,
  addUsersToSet,
  getCurrentUsersList,
  UserHistoryData,
  userHistoryKey,
} from "./upstash";

const scrape = true;

const ZenPlannerURL =
  "https://raincityathletics.sites.zenplanner.com/workout-leaderboard-daily-results.cfm";

const companyName = "raincity";

export const main = async () => {
  const currentTimeUTC = getZeroedMinutesAndSeconds(new Date());

  const midnightDate = getInstanceOfDateAtMidnight(
    currentTimeUTC,
    "America/Vancouver"
  );

  let statsForDay: SummedUserScore = {};

  if (scrape) {
    statsForDay = await scraper(ZenPlannerURL, currentTimeUTC);
  }

  console.log("poop", statsForDay);

  await updateUserList(statsForDay);

  const historyKeys = (await getCurrentUsersList(companyName)).map((userName) =>
    userHistoryKey(userName)
  );

  console.log("keys", historyKeys);

  if (isEqual(currentTimeUTC, midnightDate)) {
    await endOfDayBuild(currentTimeUTC, statsForDay, historyKeys);
  } else {
    await buildTodayLeaderBoard(companyName, statsForDay);
  }
};

const endOfDayBuild = async (
  date: Date,
  statsForDay: SummedUserScore,
  historyKeys: string[]
) => {
  // 1: update hash for eash user
  await updateUserData(date, statsForDay);

  // 2: rebuild 30 day leaderboard
  await rebuild30DayLeaderboard(historyKeys);

  // 3: build yesterday
  await buildYesterday(historyKeys);

  // 4: Add value for monthly leaderboard
  await setupMonthlyLeaderboard(historyKeys);
};

const updateUserList = async (statsForDay: SummedUserScore) => {
  const currentUserList = await getCurrentUsersList(companyName);

  const newUserList = [];

  for (const userName of Object.keys(statsForDay)) {
    if (!currentUserList.includes(userName)) {
      newUserList.push(userName);
    }
  }

  if (newUserList.length > 0) {
    const usersAdded = await addUsersToSet(companyName, newUserList);

    console.log(`${usersAdded} users added to set`);
  }
};

const updateUserData = async (date: Date, statsForDay: SummedUserScore) => {
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
