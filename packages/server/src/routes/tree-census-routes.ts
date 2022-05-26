import express from "express";
import { TreeCensus } from "@ong-forestry/schema";
import { createTreeCensus, editTreeCensuses, getTreeCensuses } from "services";
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

treeCensusRouter.post<{}, any, TreeCensus[]>(
  "/many",
  requireAuth,
  requireMembership("plotCensusId", "plotCensusId", { admin: true }),
  async (req, res) => {}
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
    res.status(200).json(treeCensuses);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error");
  }
});

treeCensusRouter.patch<{}, any, TreeCensus>(
  "/",
  requireAuth,
  requireMembership("plotCensusId", "plotCensusId"),
  async (req, res) => {
    try {
      const treeCensuses = await editTreeCensuses(
        {
          ...req.body,
          authorId: req.user?.id ?? "",
        },
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
