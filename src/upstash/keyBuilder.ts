export const leaderboardKeyBuilder = (companyName: string, ...extraKeys: string[]) => {
  return keyBuilder([companyName, "leaderboard", ...extraKeys]);
};

export const userHistoryKey = (userName: string) => {
  const joinedUserName = userName.replace(/ /g, "-");

  return keyBuilder(["user", joinedUserName, "history"]);
};

export const keyBuilder = (items: string[]) => {
  return items.join(":");
};
