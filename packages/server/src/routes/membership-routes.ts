import { Membership, MembershipRoles } from "@ong-forestry/schema";
import express from "express";
import {
  createMembership,
  getMemberships,
  GetMembershipsParams,
} from "services";

const membershipRouter = express.Router();

membershipRouter.post<{}, any, Membership>("/", async (req, res) => {
  try {
    await createMembership(req.body);
    res.status(201).send("Membership created.");
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

membershipRouter.get<{}, any, Membership>("/", async (req, res) => {
  try {
    const memberships = getMemberships({
      id: req.query.id as string,
      teamId: req.query.teamId as string,
      userId: req.query.userId as string,
      role: req.query.role as MembershipRoles,
      limit: parseInt(req.query.limit as string),
      offset: parseInt(req.query.offset as string),
    });
    res.status(201).send(memberships);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { membershipRouter };
