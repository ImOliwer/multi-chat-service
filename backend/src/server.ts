// patches
import { inject, errorHandler } from "express-custom-error";
inject(); // async / await syntax for express

// environment variable loading
import env from "mandatoryenv";
env.load(["DB_URL", "PORT", "USER_TOKEN_SECRET", "USER_TOKEN_EXPIRATION"]);

// endpoint imports
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import logger from "./util/logger";

// instances
const app = express();

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(logger.dev, logger.combined);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

// this middleware adds the json header to every response
app.use("*", (_, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// use all routers
import MessageRouter from "./routes/message_router";
import UserRouter from "./routes/user_router";
const apiRouter = express.Router();
apiRouter.use("/messages", MessageRouter);
apiRouter.use("/users", UserRouter);
app.use("/api", apiRouter);

// error handling
app.use(errorHandler());

// invalid route handling
app.use("*", (_, res) => {
  res.status(404).json({ message: "invalid endpoint" });
});

// main imports
import mongoose from "mongoose";

// main function
async function main() {
  // attempt connection to the database
  try {
    await mongoose.connect(process.env.DB_URL);
  } catch (error) {
    console.warn("Connection to database failed - exiting...");
    return;
  }

  // start the server & listen to port
  const { PORT } = process.env;
  app.listen(PORT, () => console.info("Server listening on port ", PORT));
}

// call the main
main();
