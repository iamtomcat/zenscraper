import { env } from "process";

import { isEqual, subDays } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { pino } from "pino";

import { getEndOfDayTimeZone } from "./dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "./dates/startOfDayTimeZone";
import { getZeroedMinutesAndSeconds } from "./dates/zeroMinutesSeconds";
import {
  rebuild30DayLeaderboard,
  buildYesterday,
  buildTodayLeaderBoard,
} from "./leaderboards";
import { scraper, SummedUserScore } from "./scrape";
import { userHistoryKey } from "./upstash";
import {
  addToUserHistoricalData,
  addUsersToSet,
  getCurrentUsersList,
  setupRedis,
  UserHistoryData,
} from "./upstash/upstash";
import { scrapeDay } from "./scrapeDay";

const companyName = "raincity";

const timeZone = "America/Vancouver";

const logger = pino();

const rebuild = env.REBUILD === "true";

export const main = async () => {
  logger.info("Upstash URL is %s", env.UPSTASH_REDIS_REST_URL);

  setupRedis();

  const currentTimeUTC = getZeroedMinutesAndSeconds(new Date());

  const currentTimeTimezone = utcToZonedTime(currentTimeUTC, timeZone);

  logger.info(
    "Current Time UTC %s, and current timezone {%s} for %s",
    currentTimeUTC,
    timeZone,
    currentTimeTimezone
  );

  // Start of Day is midnight
  const midnightDate = getStartOfDayTimeZone(currentTimeUTC, timeZone);

  const endOfDayYesterday = getEndOfDayTimeZone(
    subDays(currentTimeUTC, 1),
    timeZone
  );

  logger.info("end of yesterday %s", endOfDayYesterday);

  const dateToScrape = isEqual(currentTimeUTC, midnightDate)
    ? endOfDayYesterday
    : currentTimeTimezone;

  const scrapePage = env.SCRAPE === "true";

  const statsForDay = await scrapeDay(dateToScrape, scrapePage, logger);

  logger.info("Stats For Today %o", statsForDay);

  await updateUserList(statsForDay);

  const historyKeys = (await getCurrentUsersList(companyName)).map((userName) =>
    userHistoryKey(companyName, userName)
  );

  logger.info("keys %o", historyKeys);

  if (isEqual(currentTimeUTC, midnightDate) || rebuild) {
    await updateUserData(endOfDayYesterday, statsForDay);

    await endOfDayBuild(companyName, historyKeys);
  }

  await buildTodayLeaderBoard(companyName, statsForDay);
};

const endOfDayBuild = async (
  companyName: string,
  userHistoryKeys: string[]
) => {
  // 1: rebuild 30 day leaderboard
  await rebuild30DayLeaderboard(companyName, userHistoryKeys);

  // 2: build yesterday
  await buildYesterday(companyName, timeZone, userHistoryKeys);

  // 3: Add value for monthly leaderboard
  // await setupMonthlyLeaderboard(companyName, userHistoryKeys);
};

const updateUserList = async (statsForDay: SummedUserScore) => {
  const currentUserList = await getCurrentUsersList(companyName);

  const newUserList: string[] = [];

  for (const userName of Object.keys(statsForDay)) {
    if (!currentUserList.includes(userName)) {
      newUserList.push(userName);
    }
  }

  if (newUserList.length > 0) {
    const usersAdded = await addUsersToSet(companyName, newUserList);

    logger.info(`${usersAdded} users added to set`);
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

    await addToUserHistoricalData(companyName, date, historicalData);
  }
};
