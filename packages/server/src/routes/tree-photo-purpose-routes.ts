import { TreePhotoPurpose } from "@ong-forestry/schema";
import express from "express";
import { requireAuth } from "middleware/auth";
import {
  createTreePhotoPurpose,
  deleteTreePhotoPurposes,
  editTreePhotoPurposes,
  getTreePhotoPurposes,
} from "../services/tree-photo-purpose-service";

const treePhotoPurposeRouter = express.Router();

treePhotoPurposeRouter.post<{}, any, TreePhotoPurpose>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const purpose = await createTreePhotoPurpose(req.body);
      res.status(201).json(purpose);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

const parseParams = (query: any) => ({
  name: query.name as string,
  description: query.description as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treePhotoPurposeRouter.patch<{}, any, TreePhotoPurpose>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const purposes = await editTreePhotoPurposes(
        req.body,
        parseParams(req.query)
      );
      res.status(200).json(purposes);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treePhotoPurposeRouter.get<{}, any, TreePhotoPurpose>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const purposes = await getTreePhotoPurposes(req.query);
      res.status(200).json(purposes);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treePhotoPurposeRouter.delete<{}, any, TreePhotoPurpose>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      await deleteTreePhotoPurposes(parseParams(req.query));
      res.status(200).send("Photo Purposes successfully deleted.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treePhotoPurposeRouter };
