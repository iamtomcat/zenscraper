import { env } from "process";

import { isEqual, set, subDays } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { pino } from "pino";

import { getEndOfDayTimeZone } from "./dates/endOfDayTimeZone";
import { getStartOfDayTimeZone } from "./dates/startOfDayTimeZone";
import { getZeroedMinutesAndSeconds } from "./dates/zeroMinutesSeconds";
import {
  rebuild30DayLeaderboard,
  buildYesterday,
  buildTodayLeaderBoard,
} from "./leaderboards";
import { SummedUserScore } from "./scrape";
import { userHistoryKey } from "./upstash";
import {
  addToUserHistoricalData,
  addUsersToSet,
  getCurrentUsersList,
  setupRedis,
  UserHistoryData,
} from "./upstash/upstash";
import { ScrapeDayInfo, scrapeDay } from "./scrapeDay";

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

  logger.info("Date to Scrape %s", dateToScrape);

  const scrapePage = env.SCRAPE ?? "false";

  const shouldScrapePage = scrapePage.toLowerCase() === "true";

  logger.info("Scrape Page %s", scrapePage);

  const statsForDay = await scrapeDay(dateToScrape, shouldScrapePage, logger);

  logger.info("Stats For Today %o", statsForDay);

  await updateUserList(statsForDay.userScores);

  const historyKeys = (await getCurrentUsersList(companyName)).map((userName) =>
    userHistoryKey(companyName, userName)
  );

  logger.info("keys %o", historyKeys);

  if (isEqual(currentTimeUTC, midnightDate) || rebuild) {
    await updateUserData(dateToScrape, statsForDay);

    await endOfDayBuild(companyName, historyKeys);
  }

  await buildTodayLeaderBoard(companyName, statsForDay.userScores);
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

const updateUserData = async (date: Date, dayInfo: ScrapeDayInfo) => {
  if (Object.keys(dayInfo.userScores).length > 0) {
    const historicalData = Object.entries(dayInfo.userScores).map(([name, score]) => {
      const data: UserHistoryData = {
        name,
        score,
        zenDate: dayInfo.zenPlannerDate,
      };

      return data;
    });

    logger.info("Update user data %o", historicalData);

    const events = await addToUserHistoricalData(companyName, date, historicalData);

    logger.info("Events %o", events);
  }
};
