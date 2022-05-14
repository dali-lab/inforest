import express from "express";
import { ForestCensus } from "@ong-forestry/schema";
import {
  createForestCensus,
  closeForestCensus,
  getForestCensuses,
} from "services";
import { requireAuth } from "middleware";

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
      await closeForestCensus(parseParams(req.query));
      res.status(200).send("Successfully closed forest census.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { forestCensusRouter };
