import { User } from "@ong-forestry/schema";
import express from "express";
import dotenv from "dotenv";
import { createUser, getUsers, GetUsersParams } from "services";
import passport from "passport";
import jwt from "jsonwebtoken";

dotenv.config();

const userRouter = express.Router();

// userRouter.post<{}, any, User>("/", async (req, res) => {
//   try {
//     await createUser(req.body);
//     res.status(201).send("User created.");
//   } catch (e: any) {
//     console.error(e);
//     res.status(500).send(e?.message ?? "Unknown Error");
//   }
// });

userRouter.post<{}, any, User>(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res) => {
    res.status(201).send({ message: "Signup successful", user: req.user });
  }
);

userRouter.post<{}, any, User>("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) return next(new Error("An error occurred."));
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { id: user.id, email: user.email };
        const token = jwt.sign(
          { user: body },
          // TODO enforce this better
          process.env.AUTH_SECRET as string
        );
        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

userRouter.get("/", async (req, res) => {
  try {
    const users = await getUsers({
      id: req.query?.id as string,
      email: req.query?.email as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(200).json(users);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { userRouter };
