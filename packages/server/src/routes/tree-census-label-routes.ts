import { TreeCensusLabel } from "@ong-forestry/schema";
import express from "express";
import { requireAuth } from "middleware";
import {
  createTreeCensusLabel,
  deleteTreeCensusLabels,
} from "services/tree-census-label-service";

const treeCensusLabelRouter = express.Router();

treeCensusLabelRouter.post<{}, any, TreeCensusLabel>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const censusLabel = await createTreeCensusLabel(req.body);
      res.status(201).json(censusLabel);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);
treeCensusLabelRouter.delete<{ id: string }, any, TreeCensusLabel>(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      await deleteTreeCensusLabels(req.params);
      res.status(200).send("Labels successfully deleted.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treeCensusLabelRouter };
