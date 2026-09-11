import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import geoip from "geoip-lite";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    req.user = {
      ...decoded,
      id: decoded?.id || decoded?._id,
      _id: decoded?._id || decoded?.id,
    };

    // --- Analytics Tracking (Fire and Forget) ---
    try {
      if (req.user.id !== "guest") {
        const userAgent = req.headers["user-agent"] || "";
        let deviceType = "Web";
        if (/mobile/i.test(userAgent) && /android/i.test(userAgent)) deviceType = "Android";
        else if (/mobile/i.test(userAgent) && /iphone|ipad|ipod/i.test(userAgent)) deviceType = "iOS";

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";
        const ipString = Array.isArray(ip) ? ip[0] : ip;
        const geo = geoip.lookup(ipString);
        const country = geo && geo.country ? geo.country : "Unknown";

        const updateData: any = { lastActiveAt: new Date(), deviceType };
        if (country !== "Unknown") updateData.country = country;

        User.findByIdAndUpdate(req.user.id, updateData).exec().catch(() => {});
      }
    } catch (trackingError) {
      // Ignore tracking errors
    }
    // ------------------------------------------

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }
};