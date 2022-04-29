import { TreeCensus } from "@ong-forestry/schema";
import express from "express";
import { createTreeCensus, editTreeCensuses, getTreeCensuses } from "services";
import { requireAuth } from "services/auth-service";

const treeCensusRouter = express.Router();

treeCensusRouter.post<{}, any, Omit<TreeCensus, "plotCensusId">>(
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
  treeTags: (query.treeTags as string)?.split(","),
  plotCensusId: query.plotCensusId as string,
  authorId: query.authorId as string,
});

treeCensusRouter.get<{}, any, any>("/", requireAuth, async (req, res) => {
  try {
    const treeCensuses = await getTreeCensuses(parseParams(req.query));
    res.status(200).json(treeCensuses);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error");
  }
});

treeCensusRouter.patch<{}, any, Omit<TreeCensus, "plotCensusId">>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const treeCensuses = await editTreeCensuses(
        req.body,
        parseParams(req.query)
      );
      res.status(200).send(treeCensuses);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { treeCensusRouter };
