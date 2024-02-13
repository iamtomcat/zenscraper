import { Logger } from "pino";
import { formatInTimeZone } from "date-fns-tz";

import { SummedUserScore, scraper } from "./scrape";

const genders = ["male", "female"];

const validPrograms = ["SC", "FF", "FB"];

const ZenPlannerURL =
  "https://raincityathletics.sites.zenplanner.com/workout-leaderboard-daily-results.cfm";

export interface ScrapeDayInfo {
  zenPlannerDate: string;
  userScores: SummedUserScore
}

export const scrapeDay = async (
  dateToScrape: Date,
  scrapePage: boolean,
  logger: Logger
) => {
  let statsForDay: SummedUserScore = {};
  if (scrapePage) {
    logger.info(
      `Scraping date ${dateToScrape} and is ${zenPlannerDate(
        dateToScrape
      )} for zen planner`
    );

    for (const gender of genders) {
      const zenPlannerScrapedPage = `${ZenPlannerURL}?date=${zenPlannerDate(
        dateToScrape
      )}&gender=${gender}`;

      logger.info("Scraping zen planner page %s", zenPlannerScrapedPage);

      const statsForGender = await scraper(zenPlannerScrapedPage, {
        validPrograms,
      });

      statsForDay = {
        ...statsForDay,
        ...statsForGender,
      };
    }
  }

  return {
    userScores: statsForDay,
    zenPlannerDate: zenPlannerDate(dateToScrape),
  };
};

// Needs to be 2022-09-26 for zenplanner
const zenPlannerDate = (date: Date) => {
  return formatInTimeZone(date, "America/Vancouver", "yyyy-MM-dd");
};
