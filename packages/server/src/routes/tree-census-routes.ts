import express from "express";
import {
  createTreeCensus,
  deleteTreeCensuses,
  editTreeCensus,
  getTreeCensuses,
} from "services";
import { treeCensusLabelRouter } from "./tree-census-label-routes";
import { TreeCensus } from "@ong-forestry/schema";
import { requireAuth, requireMembership } from "middleware";

const treeCensusRouter = express.Router();

treeCensusRouter.post<{}, any, TreeCensus>(
  "/",
  requireAuth,
  requireMembership("plotCensusId", "plotCensusId"),
  async (req, res) => {
    try {
      const treeCensus = await createTreeCensus({
        ...req.body,
        authorId: req.user?.id ?? "",
      });
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
  requireMembership("plotCensusId", "plotCensusId"),
  async (req, res) => {
    try {
      const treeCensuses = await editTreeCensus(
        {
          ...req.body,
          authorId: req.user?.id ?? "",
        },
        req.params
      );
      res.status(200).send(treeCensuses);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treeCensusRouter.delete<{ id: string }, any, TreeCensus>(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      await deleteTreeCensuses(req.params);
      res.status(200).send("Trees deleted successfully.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treeCensusRouter.use("/labels", treeCensusLabelRouter);

export { treeCensusRouter };
