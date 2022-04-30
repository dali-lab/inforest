import { ForestCensus } from "@ong-forestry/schema";
import express from "express";
import {
  createForestCensus,
  closeForestCensus,
  getForestCensuses,
} from "services";
import { requireAuth } from "services/auth-service";

const forestCensusRouter = express.Router();

forestCensusRouter.post<{}, any, ForestCensus>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const forest = await createForestCensus(req.body);
      res.status(201).json(forest);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

const parseParams = (query: any) => ({
  forestId: query.forestId as string,
});

forestCensusRouter.get<{}, any, null>("/", requireAuth, async (req, res) => {
  try {
    const forests = await getForestCensuses(parseParams(req.query));
    res.status(200).json(forests);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error");
  }
});

// close a finished forest census
forestCensusRouter.patch<{}, any, ForestCensus>(
  "/submit",
  requireAuth,
  async (req, res) => {
    try {
      const forests = await closeForestCensus(parseParams(req.query));
      res.status(200).json(forests);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { forestCensusRouter };