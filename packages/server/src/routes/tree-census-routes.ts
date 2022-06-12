import { TreeCensus } from "@ong-forestry/schema";
import express from "express";
import { createTreeCensus, editTreeCensus, getTreeCensuses } from "services";
import { requireAuth } from "util/auth";
import { treeCensusLabelRouter } from "./tree-census-label-routes";

const treeCensusRouter = express.Router();

treeCensusRouter.post<{}, any, TreeCensus>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const treeCensus = await createTreeCensus(req.body);
      res.status(201).send(treeCensus);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

const parseParams = (query: any) => ({
  treeIds: (query.treeIds as string)?.split(","),
  plotCensusId: query.plotCensusId as string,
  authorId: query.authorId as string,
  flagged: query.flagged as boolean,
});

treeCensusRouter.get<{}, any, any>("/", requireAuth, async (req, res) => {
  try {
    const treeCensuses = await getTreeCensuses(parseParams(req.query));
    res.status(200).send(treeCensuses);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error");
  }
});

treeCensusRouter.patch<{ id: string }, any, TreeCensus>(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const treeCensuses = await editTreeCensus(req.body, req.params);
      res.status(200).send(treeCensuses);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treeCensusRouter.use("/labels", treeCensusLabelRouter);

export { treeCensusRouter };
