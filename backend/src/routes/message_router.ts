// imports
import express from "express";
import UserAuthMiddleware from "./middleware/user_auth";

// instances
const router = express.Router();

// endpoints
router.post("/send", UserAuthMiddleware, async (request, response) => {
  // necessities
  const { to, message } = request.body;
  const token = request.userToken;
  console.log(token);
});

// export the router instance
export default router;
