export const leaderboardKeyBuilder = (companyName: string, ...extraKeys: string[]) => {
  return keyBuilder([companyName, "leaderboard", ...extraKeys]);
};

export const userHistoryKey = (companyName: string, userName: string) => {
  const joinedUserName = userName.replace(/ /g, "-").toLowerCase();

  return keyBuilder([companyName, "user", joinedUserName, "history"]);
};

export const usersKey = (companyName: string) => {
  return keyBuilder([companyName, "users"]);
};

const keyBuilder = (items: string[]) => {
  return items.join(":");
};
