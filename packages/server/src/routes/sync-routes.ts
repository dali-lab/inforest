import express from "express";
import { requireAuth } from "middleware";
import { sync, SyncData } from "../services/sync-service";

const syncRouter = express.Router();

syncRouter.post<{}, any, SyncData>("/", requireAuth, async (req, res) => {
  const result = await sync(req.body);
  if (result.error) res.status(500).send(result.error);
  else res.status(200).send();
});

export { syncRouter };
