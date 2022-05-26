import express from "express";
import multer from "multer";
import { TreePhoto } from "@ong-forestry/schema";
import {
  createTreePhoto,
  getTreePhotos,
  editTreePhotos,
  deleteTreePhotos,
} from "services";
import { requireAuth, imageResize, requireMembership } from "middleware";
import { treePhotoPurposeRouter } from "./tree-photo-purpose-routes";

const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const treePhotoRouter = express.Router();

treePhotoRouter.post<{}, any, TreePhoto>(
  "/",
  requireAuth,
  requireMembership("treeCensusId", "treeCensusId"),
  async (req, res) => {
    try {
      const photo = await createTreePhoto(req.body);
      res.status(201).json(photo);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

const parseParams = (query: any) => ({
  id: query.id as string,
  treeId: query.treeId as string,
  purposeName: query.purposeName as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

treePhotoRouter.patch<{}, any, TreePhoto>(
  "/",
  requireAuth,
  requireMembership("treeCensusId", "treeCensusId"),
  async (req, res) => {
    try {
      const photos = await editTreePhotos(req.body, parseParams(req.query));
      res.status(200).json(photos);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treePhotoRouter.get<{}, any, TreePhoto>("/", requireAuth, async (req, res) => {
  try {
    const photos = await getTreePhotos(parseParams(req.query));
    res.status(200).json(photos);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

treePhotoRouter.delete<{}, any, TreePhoto>(
  "/",
  requireAuth,
  requireMembership("treeCensusId", "treeCensusId"),
  async (req, res) => {
    try {
      await deleteTreePhotos(parseParams(req.query));
      res.status(200).send("Tree photos successfully deleted.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

treePhotoRouter.use("/purposes", treePhotoPurposeRouter);

export { treePhotoRouter };
