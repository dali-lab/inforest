import express from "express";
import { TreeLabel } from "@ong-forestry/schema";
import { getTreeLabels } from "services";
import { requireAuth, retoolAuth } from "middleware";

const treeLabelRouter = express.Router();

const parseParams = (query: any) => ({
  code: query.code as string,
  description: query.description as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treeLabelRouter.get<{}, any, TreeLabel>("/", requireAuth, async (req, res) => {
  try {
    const labels = await getTreeLabels(parseParams(req.query));
    res.status(200).json(labels);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { treeLabelRouter };
