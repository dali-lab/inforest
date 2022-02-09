import { Plot } from "@ong-forestry/schema";
import express from "express";
import { createPlot, getPlots, GetPlotsParams } from "services";

const plotRouter = express.Router();

plotRouter.post<{}, any, Plot>("/", async (req, res) => {
  try {
    await createPlot(req.body);
    res.status(201).send("Plot created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

plotRouter.get<{}, any, Plot>("/", async (req, res) => {
  try {
    const plots = getPlots({
      number: parseInt(req.query.number as string),
      name: req.query.name as string,

      latMin: parseFloat(req.query.latMin as string),
      latMax: parseFloat(req.query.latMax as string),
      longMin: parseFloat(req.query.longMin as string),
      longMax: parseFloat(req.query.longMax as string),
    });
    res.status(201).send(plots);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});
