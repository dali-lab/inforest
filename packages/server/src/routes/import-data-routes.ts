import express from "express";
import { requireAuth } from "middleware"
import { bulkUpsertSheetRows } from "services/import-data-service";

const importDataRouter = express.Router();

importDataRouter.post<{}, any, any>("/", requireAuth, async (req, res) => {
  try {
    const conf = await bulkUpsertSheetRows(
      req.body.sheet, 
      req.body.forestId,
      req.body.forestCensusId, 
      req.body.authorId
    );
    res.status(201).send(conf);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message ?? "Unknown error.");
  }
});

export { importDataRouter };