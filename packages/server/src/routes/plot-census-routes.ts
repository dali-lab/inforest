import express from "express";
import { PlotCensus } from "@ong-forestry/schema";
import {
  createPlotCensus,
  approve,
  getPlotCensuses,
  submitForReview,
} from "services";
import { requireAuth, requireMembership, retoolAuth } from "middleware";

const plotCensusRouter = express.Router();

plotCensusRouter.post<{ plotId: string }, any, PlotCensus>(
  "/:plotId",
  requireAuth,
  async (req, res) => {
    try {
      const plotCensus = await createPlotCensus(req.params.plotId);
      res.status(201).send(plotCensus);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

const parseParams = (query: any) => ({
  id: query.id as string,

  forestCensusId: query.forestCensusId as string,
  plotId: query.plotId as string,

  userId: query.userId as string,
  statuses: (query.statuses as string)?.split(","),

  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

plotCensusRouter.get<{}, any, any>("/", requireAuth, async (req, res) => {
  try {
    const plotCensuses = await getPlotCensuses(parseParams(req.query));
    res.status(200).json(plotCensuses);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

// mark ready for review
plotCensusRouter.patch<{ plotId: string }, any, any>(
  "/submit/:plotId",
  requireAuth,
  requireMembership("plotId", "plotId"),
  async (req, res) => {
    try {
      const plotCensus = await submitForReview(parseParams(req.params));
      res.status(200).send(plotCensus);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

// approve plot in review
plotCensusRouter.patch<{}, any, any>(
  "/approve",
  retoolAuth,
  async (req, res) => {
    try {
      await approve(parseParams(req.query));
      res.status(200).send("Successfully approved plot census.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { plotCensusRouter };
