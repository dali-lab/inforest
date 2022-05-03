import { PlotCensus } from "@ong-forestry/schema";
import express from "express";
import { approve, getPlotCensuses, submitForReview } from "services";
import { requireAuth } from "services/auth-service";

const plotCensusRouter = express.Router();

const parseParams = (query: any) => ({
  forestCensusId: query.forestCensusId as string,
  plotId: query.plotId as string,

  userId: query.userId as string,
  status: query.status as string,

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
plotCensusRouter.patch<{}, any, Pick<PlotCensus, "plotId">>(
  "/submit",
  requireAuth,
  async (req, res) => {
    try {
      await submitForReview(req.body);
      res.status(200).send("successfully submitted for review");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

// approve plot in review
plotCensusRouter.patch<{}, any, Pick<PlotCensus, "id">>(
  "/submit",
  requireAuth,
  async (req, res) => {
    try {
      await approve(req.body);
      res.status(200).send("successfully submitted for review");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { plotCensusRouter };
