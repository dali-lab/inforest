import express from "express";
import { Team } from "@ong-forestry/schema";
import { createTeam, deleteTeams, editTeams, getTeams } from "services";
import { requireAuth } from "middleware";

const teamRouter = express.Router();

teamRouter.post<{}, any, Team>("/", requireAuth, async (req, res) => {
  try {
    const team = await createTeam(req.body);
    res.status(200).json(team);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  id: query?.id as string,
  name: query?.name as string,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

teamRouter.patch<{}, any, Team>("/", requireAuth, async (req, res) => {
  try {
    const teams = await editTeams(req.body, parseParams(req.query));
    res.status(200).json(teams);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

teamRouter.get("/", requireAuth, async (req, res) => {
  try {
    const teams = await getTeams(parseParams(req.query));
    res.status(200).json(teams);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

teamRouter.delete("/", requireAuth, async (req, res) => {
  try {
    await deleteTeams(parseParams(req.query));
    res.status(200).send("Teams successfully deleted.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { teamRouter };
