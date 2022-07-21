import express from "express";
import { requireAuth } from "middleware";
import { SyncData } from "@ong-forestry/schema";
import { sync } from "../services/sync-service";

const syncRouter = express.Router();

syncRouter.post<{}, any, SyncData>("/", requireAuth, async (req, res) => {
  try {
    const result = await sync(req.body);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

export { syncRouter };
