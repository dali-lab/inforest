import express from "express";
import { Membership } from "@ong-forestry/schema";
import {
  createMembership,
  deleteMemberships,
  editMemberships,
  getMemberships,
} from "services";
import { requireAuth, requireMembership, retoolAuth } from "middleware";
import { MembershipRoles } from "../enums";

const membershipRouter = express.Router();

membershipRouter.post<
  {},
  any,
  Pick<Membership, "teamId" | "role"> & { email: string }
>("/", retoolAuth, async (req, res) => {
  try {
    const membership = await createMembership(req.body);
    res.status(201).json(membership);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

const parseParams = (query: any) => ({
  id: query.id as string,
  teamId: query.teamId as string,
  userId: query.userId as string,
  role: query.role as MembershipRoles,
  limit: parseInt(query.limit as string),
  offset: parseInt(query.offset as string),
});

membershipRouter.patch<{}, any, Membership>(
  "/",
  requireAuth,
  requireMembership("teamId", "teamId", { admin: true }),
  async (req, res) => {
    try {
      const memberships = await editMemberships(
        req.body,
        parseParams(req.query)
      );
      res.status(200).json(memberships);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

membershipRouter.get<{}, any, Membership>(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const memberships = await getMemberships(parseParams(req.query));
      res.status(200).json(memberships);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

membershipRouter.delete<{}, any, Membership>(
  "/",
  requireAuth,
  requireMembership("teamId", "teamId", { admin: true }),
  async (req, res) => {
    try {
      await deleteMemberships(parseParams(req.query));
      res.status(200).send("Memberships successfully deleted.");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { membershipRouter };
