import { Trip } from "@ong-forestry/schema";
import express from "express";
import { createTrip, deleteTrips, editTrips, getTrips } from "services";
import { requireAuth } from "services/auth-service";

const tripRouter = express.Router();

tripRouter.post<{}, any, Trip>("/", requireAuth, async (req, res) => {
  try {
    const trip = await createTrip(req.body);
    res.status(201).json(trip);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  id: query.id as string,
  name: query.name as string,
  forestId: query.forestId as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

tripRouter.patch<{}, any, Trip>("/", requireAuth, async (req, res) => {
  try {
    const trips = await editTrips(req.body, parseParams(req.query));
    res.status(200).json(trips);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

tripRouter.get<{}, any, Trip>("/", requireAuth, async (req, res) => {
  try {
    const trips = await getTrips(parseParams(req.query));
    res.status(200).json(trips);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

tripRouter.delete<{}, any, Trip>("/", requireAuth, async (req, res) => {
  try {
    await deleteTrips(parseParams(req.query));
    res.status(200).send("Trips successfully deleted.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { tripRouter };
