import { Forest } from "@ong-forestry/schema";
import express from "express";
import {
  createForest,
  deleteForests,
  editForests,
  getForests,
  GetForestsParams,
} from "services";
import { requireAuth } from "middleware";

const forestRouter = express.Router();

forestRouter.post<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    const forest = await createForest(req.body);
    res.status(201).json(forest);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  id: query.id as string,
  name: query.name as string,
  teamId: query.teamId as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

forestRouter.patch<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    const forests = await editForests(req.body, parseParams(req.query));
    res.status(201).json(forests);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

forestRouter.get<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    const forests = await getForests(parseParams(req.query));
    res.status(201).json(forests);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

forestRouter.delete<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    await deleteForests(parseParams(req.query));
    res.status(201).send("Forests successfully deleted.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { forestRouter };
