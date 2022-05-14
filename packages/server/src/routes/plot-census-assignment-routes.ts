import express from "express";
import { createAssignment } from "services/plot-census-assignment-service";
import { requireAuth } from "middleware";

const plotCensusAssignmentRouter = express.Router();

plotCensusAssignmentRouter.post<
  {},
  any,
  {
    plotId: string;
    userId: string;
  }
>("/", requireAuth, async (req, res) => {
  try {
    const assignment = await createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { plotCensusAssignmentRouter };
