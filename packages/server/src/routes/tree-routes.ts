import { Tree } from "@ong-forestry/schema";
import express from "express";
import {
  createTrees,
  getTrees,
  GetTreesParams,
  editTrees,
  deleteTrees,
} from "services";
import { requireAuth } from "services/auth-service";
import { treePhotoRouter } from "./tree-photo-routes";
import { treeSpeciesRouter } from "./tree-species-routes";

const treeRouter = express.Router();

treeRouter.post<{}, any, Tree>("/", requireAuth, async (req, res) => {
  try {
    const tree = await createTrees(req.body);
    res.status(201).json(tree);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  tags: (query.tags as string)?.split(","),
  plotNumbers: (query.plotNumbers as string)
    ?.split(",")
    .map((plotNumber) => parseInt(plotNumber)),
  speciesCodes: (query.speciesCodes as string)?.split(","),
  statusNames: (query.statusNames as string)?.split(","),
  latMin: parseFloat(query.latMin as string),
  latMax: parseFloat(query.latMax as string),
  longMin: parseFloat(query.longMin as string),
  longMax: parseFloat(query.longMax as string),
  plotXMin: parseFloat(query.plotXMin as string),
  plotXMax: parseFloat(query.plotXMax as string),
  plotYMin: parseFloat(query.plotYMin as string),
  plotYMax: parseFloat(query.plotYMax as string),
  dbhMin: parseFloat(query.dbhMin as string),
  dbhMax: parseFloat(query.dbhMax as string),
  heightMin: parseFloat(query.heightMin as string),
  heightMax: parseFloat(query.heightMax as string),
  tripId: query.tripId as string,
  authorId: query.authorId as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treeRouter.patch<{}, any, Tree>("/", requireAuth, async (req, res) => {
  try {
    const trees = await editTrees(req.body, parseParams(req.query));
    res.status(200).json(trees);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.get<{}, any, Tree>("/", requireAuth, async (req, res) => {
  try {
    const trees = await getTrees(parseParams(req.query));
    res.status(200).json(trees);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.delete<{}, any, Tree>("/", requireAuth, async (req, res) => {
  try {
    await deleteTrees(parseParams(req.query));
    res.status(201).send("Trees deleted successfully.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.use("/photos", treePhotoRouter);
treeRouter.use("/species", treeSpeciesRouter);

export { treeRouter };
