import { Trip } from "@ong-forestry/schema";
import express from "express";
import { createTrip, getTrips, GetTripsParams } from "services";

const tripRouter = express.Router();

tripRouter.post<{}, any, Trip>("/", async (req, res) => {
  try {
    await createTrip(req.body);
    res.status(201).send("Trip created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

tripRouter.get<{}, any, Trip>("/", async (req, res) => {
  try {
    const trips = getTrips({
      id: req.query.id as string,
      name: req.query.name as string,
      forestId: req.query.forestId as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(201).send(trips);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { tripRouter };
