import express from "express";
import { createAssignment } from "services/plot-census-assignment-service";
import { requireAuth, requireMembership } from "middleware";

const plotCensusAssignmentRouter = express.Router();

plotCensusAssignmentRouter.post<
  {},
  any,
  {
    plotId: string;
    userId: string;
  }
>("/", requireAuth, requireMembership("plotId", "plotId"), async (req, res) => {
  try {
    if (req.user == undefined) throw new Error("Not logged in");

    const assignment = await createAssignment({
      ...req.body,
      userId: req.user.id ?? "",
    });
    res.status(201).json(assignment);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { plotCensusAssignmentRouter };
