import express from "express";
import { submitForReview } from "services";
import { requireAuth } from "services/auth-service";

const plotCensusRouter = express.Router();

// mark ready for review
plotCensusRouter.patch<{}, any, { plotId: string }>(
  "/submit",
  requireAuth,
  async (req, res) => {
    try {
      await submitForReview(req.body);
      res.status(200).send("successfully submitted for review");
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e?.message ?? "Unknown error.");
    }
  }
);

export { plotCensusRouter };
