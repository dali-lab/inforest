import { User } from "@ong-forestry/schema";
import express from "express";
import { createUser, getUsers, GetUsersParams } from "services";

const userRouter = express.Router();

userRouter.post<{}, any, User>("/", async (req, res) => {
  try {
    await createUser(req.body);
    res.status(201).send("User created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown Error");
  }
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
