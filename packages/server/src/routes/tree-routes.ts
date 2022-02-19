import { Tree, TreePhoto } from "@ong-forestry/schema";
import express from "express";
import {
  createTreeEntry,
  getTrees,
  GetTreesParams,
  createTreePhoto,
  getTreePhotos,
  GetTreePhotosParams,
} from "services";
import { requireAuth } from "services/auth-service";

const treeRouter = express.Router();

treeRouter.post<{}, any, Tree>("/", requireAuth, async (req, res) => {
  try {
    await createTreeEntry(req.body);
    res.status(201).send("Tree entry created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.get("/", requireAuth, async (req, res) => {
  try {
    const trees = await getTrees({
      tags: (req.query.tags as string)?.split(","),
      plotNumbers: (req.query.plotNumbers as string)
        ?.split(",")
        .map((plotNumber) => parseInt(plotNumber)),
      speciesCodes: (req.query.speciesCodes as string)?.split(","),
      statusNames: (req.query.statusNames as string)?.split(","),
      latMin: parseFloat(req.query.latMin as string),
      latMax: parseFloat(req.query.latMax as string),
      longMin: parseFloat(req.query.longMin as string),
      longMax: parseFloat(req.query.longMax as string),
      plotXMin: parseFloat(req.query.plotXMin as string),
      plotXMax: parseFloat(req.query.plotXMax as string),
      plotYMin: parseFloat(req.query.plotYMin as string),
      plotYMax: parseFloat(req.query.plotYMax as string),
      dbhMin: parseFloat(req.query.dbhMin as string),
      dbhMax: parseFloat(req.query.dbhMax as string),
      heightMin: parseFloat(req.query.heightMin as string),
      heightMax: parseFloat(req.query.heightMax as string),
      tripId: req.query.tripId as string,
      authorId: req.query.authorId as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(200).json(trees);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.post<{}, any, TreePhoto>("/photos", async (req, res) => {
  try {
    await createTreePhoto(req.body);
    res.status(201).send("Team created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treeRouter.get("/photos", async (req, res) => {
  try {
    const photos = await getTreePhotos({
      id: req.query.id as string,
      treeTag: req.query.treeTag as string,
      purposeName: req.query.purposeName as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(200).json(photos);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { treeRouter };
