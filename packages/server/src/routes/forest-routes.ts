import { Forest } from "@ong-forestry/schema";
import express from "express";
import { createForest, getForests, GetForestsParams } from "services";
import { requireAuth } from "services/auth-service";

const forestRouter = express.Router();

forestRouter.post<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    await createForest(req.body);
    res.status(201).send("Forest created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

forestRouter.get<{}, any, Forest>("/", requireAuth, async (req, res) => {
  try {
    const forests = await getForests({
      id: req.query.id as string,
      name: req.query.name as string,
      teamId: req.query.teamId as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(201).send(forests);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { forestRouter };
