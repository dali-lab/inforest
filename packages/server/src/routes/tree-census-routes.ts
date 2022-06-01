import { TreeCensus } from "@ong-forestry/schema";
import express from "express";
import { createTreeCensus, editTreeCensuses, getTreeCensuses } from "services";
import { requireAuth } from "util/auth";

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

treeCensusRouter.patch<{}, any, TreeCensus>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const treeCensuses = await editTreeCensuses(
        req.body,
        parseParams(req.query)
      );
      console.log(treeCensuses);
      res.status(200).send(treeCensuses);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treeCensusRouter };
