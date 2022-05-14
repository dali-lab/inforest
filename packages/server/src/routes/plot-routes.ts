import express from "express";
import { Plot } from "@ong-forestry/schema";
import { createPlot, deletePlots, editPlots, getPlots } from "services";
import { requireAuth } from "middleware";
import { plotCensusRouter } from "./plot-census-routes";

const plotRouter = express.Router();

plotRouter.post<{}, any, Plot>("/", requireAuth, async (req, res) => {
  try {
    const plot = await createPlot(req.body);
    res.status(201).send(plot);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  number: parseInt(query.number as string),
  name: query.name as string,
  forestId: query.forestId as string,
  latMin: parseFloat(query.latMin as string),
  latMax: parseFloat(query.latMax as string),
  longMin: parseFloat(query.longMin as string),
  longMax: parseFloat(query.longMax as string),
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

plotRouter.patch<{}, any, Plot>("/", requireAuth, async (req, res) => {
  try {
    const plots = await editPlots(req.body, parseParams(req.query));
    res.status(200).send(plots);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

plotRouter.get<{}, any, Plot>("/", requireAuth, async (req, res) => {
  try {
    const plots = await getPlots(parseParams(req.query));
    res.status(200).send(plots);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

plotRouter.delete<{}, any, Plot>("/", requireAuth, async (req, res) => {
  try {
    await deletePlots(parseParams(req.query));
    res.status(200).send("Plots successfully deleted.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

plotRouter.use("/census", plotCensusRouter);

export { plotRouter };
