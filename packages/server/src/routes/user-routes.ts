import express from "express";
import { User } from "@ong-forestry/schema";
import { createUser, deleteUsers, editUsers, getUsers } from "services";
import { requireAuth } from "middleware";
import { authRouter } from "./auth-routes";

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

userRouter.get<{}, any, User>(
  "/getTokenUser",
  requireAuth,
  async (req, res) => {
    console.log(req);
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
