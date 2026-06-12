import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import express from "express";
import logger from "../config/logger.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_SECRET = randomBytes(32).toString("hex");

const usersById = new Map();
const userIdsByEmail = new Map();
const sessions = new Map();
const favoritesByUserId = new Map();

let demoWarningLogged = false;

function logDemoWarning() {
  if (demoWarningLogged) return;
  demoWarningLogged = true;
  logger.warn(
    "Demo auth/favorites API is using in-memory storage; accounts and favorites reset on restart.",
  );
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;

  const candidateHash = scryptSync(String(password), salt, 64);
  const storedPasswordHash = Buffer.from(hash, "hex");

  return (
    candidateHash.length === storedPasswordHash.length &&
    timingSafeEqual(candidateHash, storedPasswordHash)
  );
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(header, payload) {
  return createHmac("sha256", TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
}

function issueToken(user) {
  const now = Date.now();
  const expiresAt = now + TOKEN_TTL_MS;
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode({
    sub: user.userId,
    user_id: user.userId,
    userId: user.userId,
    email: user.email,
    name: user.name,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000),
  });
  const signature = signToken(header, payload);
  const token = `${header}.${payload}.${signature}`;

  sessions.set(token, {
    userId: user.userId,
    expiresAt,
  });

  return token;
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") return "";
  return authHeader.replace(/^Bearer\s+/i, "").trim();
}

function getUserFromToken(token) {
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    sessions.delete(token);
    return null;
  }

  const expectedSignature = signToken(header, payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    sessions.delete(token);
    return null;
  }

  const user = usersById.get(session.userId);
  return user ? { userId: session.userId, ...user } : null;
}

function requireUser(req, res, next) {
  const token = getBearerToken(req);
  const user = getUserFromToken(token);

  if (!user) {
    return res.status(401).json({
      status: "Failed",
      message: "Unauthorized - invalid or missing auth token",
    });
  }

  req.demoUser = user;
  req.demoToken = token;
  return next();
}

function getFavorites(userId) {
  if (!favoritesByUserId.has(userId)) {
    favoritesByUserId.set(userId, new Set());
  }
  return favoritesByUserId.get(userId);
}

function serializeUser(user) {
  return {
    user_id: user.userId,
    name: user.name,
    email: user.email,
  };
}

export function createDemoAuthRouter() {
  logDemoWarning();

  const router = express.Router();

  router.post("/auth/register", (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const name = String(req.body?.name || "").trim();
    const password = String(req.body?.password || "");

    if (!isValidEmail(email) || !name || !password) {
      return res.status(400).json({
        status: "Failed",
        message: "A valid email, password, and name are required",
      });
    }

    if (userIdsByEmail.has(email)) {
      return res.status(409).json({
        status: "Failed",
        message: "User with this email already exists",
      });
    }

    const userId = `demo-user-${randomBytes(12).toString("hex")}`;
    const user = {
      email,
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    usersById.set(userId, user);
    userIdsByEmail.set(email, userId);
    favoritesByUserId.set(userId, new Set());

    const token = issueToken({ userId, ...user });

    return res.json({
      status: "Success",
      auth_token: token,
      ...serializeUser({ userId, ...user }),
    });
  });

  router.post("/auth/login", (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({
        status: "Failed",
        message: "A valid email and password are required",
      });
    }

    const userId = userIdsByEmail.get(email);
    const user = userId ? usersById.get(userId) : null;

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    const token = issueToken({ userId, ...user });

    return res.json({
      status: "Success",
      auth_token: token,
      ...serializeUser({ userId, ...user }),
    });
  });

  router.post("/auth/logout", requireUser, (req, res) => {
    sessions.delete(req.demoToken);
    return res.json({ status: "Success" });
  });

  router.get("/user/profile", requireUser, (req, res) => {
    const favorites = Array.from(getFavorites(req.demoUser.userId));

    return res.json({
      status: "Success",
      ...serializeUser(req.demoUser),
      favorite_restaurant_ids: favorites,
    });
  });

  router.get("/user/favorites", requireUser, (req, res) => {
    const favorites = Array.from(getFavorites(req.demoUser.userId));

    return res.json({
      favorites,
      count: favorites.length,
      last_updated: new Date().toISOString(),
    });
  });

  router.post("/user/favorites", requireUser, (req, res) => {
    const restaurantId = String(req.body?.restaurant_id || "").trim();

    if (!restaurantId) {
      return res.status(400).json({
        status: "Failed",
        message: "restaurant_id is required",
      });
    }

    const favorites = getFavorites(req.demoUser.userId);
    const action = favorites.has(restaurantId) ? "removed" : "added";

    if (action === "removed") {
      favorites.delete(restaurantId);
    } else {
      favorites.add(restaurantId);
    }

    const favoritesArray = Array.from(favorites);

    return res.json({
      status: "Success",
      action,
      restaurant_id: restaurantId,
      favorites: favoritesArray,
      count: favoritesArray.length,
    });
  });

  return router;
}
