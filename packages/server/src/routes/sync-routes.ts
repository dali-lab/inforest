import express from "express";
import { requireAuth } from "middleware";
import { sync, SyncData } from "../services/sync-service";

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
