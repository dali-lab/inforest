import express from "express";
import { TreeLabel } from "@ong-forestry/schema";
import {
  createTreeLabel,
  deleteTreeLabels,
  editTreeLabels,
  getTreeLabels,
} from "services";
import { requireAuth } from "middleware";

const treeLabelRouter = express.Router();

treeLabelRouter.post<{}, any, TreeLabel>("/", requireAuth, async (req, res) => {
  try {
    const label = await createTreeLabel(req.body);
    res.status(201).json(label);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  code: query.code as string,
  description: query.description as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treeLabelRouter.patch<{}, any, TreeLabel>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const labels = await editTreeLabels(req.body, parseParams(req.query));
      res.status(200).json(labels);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treeLabelRouter.get<{}, any, TreeLabel>("/", requireAuth, async (req, res) => {
  try {
    const labels = await getTreeLabels(req.query);
    res.status(200).json(labels);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeLabelRouter.delete<{}, any, TreeLabel>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      await deleteTreeLabels(parseParams(req.query));
      res.status(200).send("Labels successfully deleted.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treeLabelRouter };
