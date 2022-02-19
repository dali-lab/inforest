import { Team } from "@ong-forestry/schema";
import express from "express";
import { createTeam, getTeams, GetTeamsParams } from "services";
import { requireAuth } from "services/auth-service";

const teamRouter = express.Router();

teamRouter.post<{}, any, Team>("/", requireAuth, async (req, res) => {
  try {
    await createTeam(req.body);
    res.status(201).send("Team created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

teamRouter.get("/", requireAuth, async (req, res) => {
  try {
    const teams = await getTeams({
      id: req.query?.id as string,
      name: req.query?.name as string,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(200).json(teams);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { teamRouter };
