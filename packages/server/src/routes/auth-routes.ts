import express from "express";
import passport from "passport";
import { User, VerificationCode } from "@ong-forestry/schema";
import { requireAuth } from "middleware";
import {
  createToken,
  sendVerificationCode,
  verifyVerificationCode,
} from "../util";

const authRouter = express.Router();

authRouter.post<{}, any, User>("/signup", (req, res, next) => {
  passport.authenticate(
    "signup",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) throw err;
        if (!user) throw new Error();
      } catch (e: any) {
        console.error(e);
        res.status(500).send(e?.message ?? "An unknown error has occurred");
      }
    }
  )(req, res, next);
});

authRouter.post<{}, any, User>("/login", (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) throw err;
      if (!user) throw new Error("Incorrect credentials");

      const token = createToken(user);

      req.login(user, (err: any) => {});
      res.status(201).json({ user, token });
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "An unknown error has occurred");
    }
  })(req, res, next);
});

authRouter.delete<{}, any, User>(
  "/logout",
  requireAuth,
  async (req, res, next) => {
    await req.logout(); // only works with sessions?
    res.status(200).json({});
  }
);

authRouter.get<{}, any, User>("/resend-code", async (req, res, next) => {
  try {
    sendVerificationCode(req.body.email);

    res
      .status(200)
      .send("Sent verification code. It will expire in 5 minutes.");
  } catch (e: any) {
    console.log(e);
    res.status(200).send(e?.message ?? "An unknown error occured.");
  }
});

authRouter.patch<{}, any, VerificationCode>(
  "/verify",
  async (req, res, next) => {
    try {
      const user = await verifyVerificationCode(req.body);

      const token = createToken(user);

      res.status(201).json({ user: req.body, token });
    } catch (e: any) {
      console.log(e);
      res.status(200).send(e?.message ?? "An unknown error occured.");
    }
  }
);

export { authRouter };
