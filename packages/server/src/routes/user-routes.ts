import { User } from "@ong-forestry/schema";
import express from "express";
import { createUser, deleteUsers, editUsers, getUsers } from "services";
import { requireAuth } from "services/auth-service";

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
