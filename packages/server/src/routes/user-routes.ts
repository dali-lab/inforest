import express from "express";
import { User } from "@ong-forestry/schema";
import { createUser, deleteUsers, editUsers, getUsers } from "services";
import { requireAuth } from "middleware";
import jwt from "jsonwebtoken";
import { authRouter } from "./auth-routes";
import { decodeToken } from "../util/auth";

const userRouter = express.Router();

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

userRouter.get<{ token: string }, any, User>(
  "/:token",
  requireAuth,
  async (req, res) => {
    const { token } = req.params;
    try {
      const id = decodeToken(token);
      if (!id) throw new Error("Token could not be decoded.");
      const users: User[] = await getUsers({ id });
      res.status(200).json(users[0]);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

userRouter.patch<{}, any, User>("/", requireAuth, async (req, res) => {
  try {
    const users = await editUsers(req.body, parseParams(req.query));
    res.status(200).json(users);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

userRouter.use("", authRouter);
export { userRouter };
