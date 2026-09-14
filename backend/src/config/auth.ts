const isProduction = process.env.NODE_ENV === "production";

export const authConfig = {
  accessToken: {
    expiresIn: "15m",
    cookieName: "financeflow_access_token",
  },

  refreshToken: {
    expiresIn: "30d",
    cookieName: "financeflow_refresh_token",
  },

  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  },
} as const;