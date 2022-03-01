import { User } from "@ong-forestry/schema";
import express from "express";
import dotenv from "dotenv";
import {
  createUser,
  deleteUsers,
  editUsers,
  getUsers,
  GetUsersParams,
} from "services";
import passport from "passport";
import jwt from "jsonwebtoken";
import { requireAuth } from "services/auth-service";

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
    res.status(201).json({ message: "Signup successful" });
  }
);

userRouter.post<{}, any, User>("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) throw err;
      if (!user) throw new Error("Incorrect credentials");
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { id: user.id, email: user.email };
        const token = jwt.sign(
          { user: body },
          // TODO enforce this better
          process.env.AUTH_SECRET as string
        );
        // TODO: do we need cookies?
        // res.header("Set-Cookie", `user_token=${token}`);
        res.status(200).json({ user, token });
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "An unknown error has occurred");
    }
  })(req, res, next);
});

// userRouter.delete<{}, any, User>("/logout", async (req, res, next) => {
//   await req.logout();
//   res.status(200).json({});
// });

const parseParams = (query: any) => ({
  id: query?.id as string,
  email: query?.email as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

userRouter.get<{}, any, User>("/", requireAuth, async (req, res) => {
  try {
    const users = await getUsers(parseParams(req.query));
    res.status(200).json(users);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

userRouter.patch<{}, any, User>("/", requireAuth, async (req, res) => {
  try {
    const users = await editUsers(req.body, parseParams(req.query));
    res.status(200).json(users);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

// userRouter.delete<{}, any, User>("/", requireAuth, async (req, res) => {
//   try {
//     await deleteUsers(parseParams(req.query));
//     res.status(200).send("Users successfully deleted.");
//   } catch (e: any) {
//     console.error(e);
//     res.status(500).send(e?.message ?? "Unknown error.");
//   }
// });

export { userRouter };
