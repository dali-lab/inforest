import { TreePhotoPurpose } from "@ong-forestry/schema";
import express from "express";
import { requireAuth, retoolAuth } from "middleware/auth";
import { getTreePhotoPurposes } from "../services/tree-photo-purpose-service";

const treePhotoPurposeRouter = express.Router();

const parseParams = (query: any) => ({
  name: query.name as string,
  description: query.description as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treePhotoPurposeRouter.get<{}, any, TreePhotoPurpose>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const purposes = await getTreePhotoPurposes(parseParams(req.query));
      res.status(200).json(purposes);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treePhotoPurposeRouter };
