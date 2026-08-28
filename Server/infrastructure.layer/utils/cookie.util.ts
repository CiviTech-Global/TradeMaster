import { Response } from "express";
import { env } from "../config/env";
import { getTokenExpiryDate } from "./jwt.util";

const isProduction = env.NODE_ENV === "production";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    path: "/",
  };

  const accessExpiry = getTokenExpiryDate(env.JWT_EXPIRES_IN);
  const refreshExpiry = getTokenExpiryDate(env.JWT_REFRESH_EXPIRES_IN);

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    maxAge: accessExpiry.getTime() - Date.now(),
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: refreshExpiry.getTime() - Date.now(),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}
