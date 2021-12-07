// imports
import express from "express";
import { validate as validateEmail } from "email-validator";
import UserModel from "../models/user";
import { hash, verify as verifyHash } from "argon2";
import { signToken, validateToken } from "@util/jwt";
import { extractBearerToken } from "@util/express";
import UserTokenModel from "../models/usertokens";

// instances
const router = express.Router();

// check handlers
const NAME_REGEX = /^([a-zA-Z0-9_])+$/;

// create user
router.post("/register", async (request, response) => {
  // destructure required properties
  const { username, email, lock } = request.body;

  // ensure the presence of required properties
  if (!username || !email || !lock) {
    return response.status(400).json({
      message: "username, email and lock are required",
    });
  }

  // ensure the length of the username
  const usernameLength = username.length;
  if (usernameLength < 4 || usernameLength > 16) {
    return response.status(400).json({
      message: "username must be between 4-16 characters",
    });
  }

  // ensure username syntax
  if (!NAME_REGEX.test(username)) {
    return response.status(400).json({
      message:
        "username may only be alphanumeric, and optionally contain underscores",
    });
  }

  // validate the email passed
  if (!validateEmail(email)) {
    return response.status(400).json({
      message: "email entered is invalid",
    });
  }

  // ensure password (lock) length
  const lockLength = lock.length;
  if (lockLength < 8) {
    return response.status(400).json({
      message: "password must be at least 8 characters",
    });
  }

  // ensure password chars (special chars, numbers and capital letter)
  {
    let numbers = 0;
    let capitals = 0;

    for (let index = 0; index < lockLength; index++) {
      const code = lock.charCodeAt(index);

      if (code >= 65 && code <= 90) {
        capitals++;
        continue;
      }

      if (code >= 48 && code <= 57) {
        numbers++;
      }
    }

    const missing = [];
    if (numbers < 2) missing.push("numbers");
    if (capitals < 1) missing.push("capitals");

    if (missing.length > 0) {
      return response.status(400).json({
        message: "missing criteria for password requirements",
        missing,
      });
    }
  }

  // ensure absence of name and email
  const exactName = username.toLowerCase();
  const exactEmail = email.toLowerCase();
  const foundUser = await UserModel.findOne({
    $or: [{ name: exactName }, { email: exactEmail }],
  });

  if (foundUser) {
    const foundName = foundUser.name;
    const foundEmail = foundUser.email;

    if (foundName === exactName && foundEmail === exactEmail) {
      return response
        .status(400)
        .json({ message: "username and email are already in use" });
    } else if (foundName === exactName) {
      return response
        .status(400)
        .json({ message: "username is already in use" });
    } else if (foundEmail === exactEmail) {
      return response.status(400).json({ message: "email is already in use" });
    }
  }

  // create & save user
  new UserModel({
    name: exactName,
    email: exactEmail,
    lock: await hash(lock),
  }).save();

  // return the success
  response.status(200).json({
    message: "successful account creation",
  });
});

// login to an account by email and lock (password)
router.post("/login", async (request, response) => {
  // necessities
  const { user, lock } = request.body;

  // ensure presence of name/email and lock
  if (!user || !lock) {
    return response.status(400).json({
      message: "email/name and/or lock is missing",
    });
  }

  // find user by email or name
  const exactUser = user.toString().toLowerCase();
  const foundUser = await UserModel.findOne({
    $or: [{ email: exactUser }, { name: exactUser }],
  });

  // ensure presence and password match of found user
  if (!foundUser || !(await verifyHash(foundUser.lock, lock))) {
    return response.status(400).json({
      message: "could not find/verify user with passed credentials",
    });
  }

  // provide token with expiration time of 24 hours
  const expirationTime = Number.parseInt(process.env.USER_TOKEN_EXPIRATION);
  const signedToken = signToken(
    {
      createdAt: foundUser.createdAt,
      name: foundUser.name,
      email: foundUser.email,
      bio: foundUser.bio || null,
      avatar: foundUser.avatar || null,
    },
    process.env.USER_TOKEN_SECRET,
    expirationTime
  );

  // save token to collection
  await new UserTokenModel({
    user: foundUser._id,
    token: signedToken,
  }).save();

  // respond
  response.status(200).json({
    message: "successfully logged in",
    token: signedToken,
    expiresIn: expirationTime,
  });
});

// fetch profile by auth
router.get("/profile", async (request, response) => {
  // necessities
  const token = extractBearerToken(request);

  // respond with an "Unauthorized" if the auth header is missing
  if (token === undefined) {
    return response.status(401).json({
      message: "missing authorization header",
    });
  }

  // respond with an invalid token format if token is null
  if (token === null) {
    return response.status(400).json({
      message: "invalid token format - must be 'Bearer Token'",
    });
  }

  // validate token
  const validated = await validateToken(token, process.env.USER_TOKEN_SECRET);
  console.log(validated);

  // if the token was invalid, respond with "bad token"
  if (!validated) {
    return response.status(400).json({
      message: "bad token",
    });
  }

  // fetch from the database to ensure presence of token
  const fromDatabase = await UserTokenModel.findOne({ token });
  if (!fromDatabase) {
    return response.status(400).json({
      message: "token is inactive",
    });
  }

  // respond with the user's profile
  response.json({
    message: "successful profile fetch",
    profile: validated,
  });
});

// export the router instance
export default router;
