import { PlotCensus } from "db/models";

export class CensusExistsError extends Error {
  existingCensus: PlotCensus;

  constructor(existingCensus: PlotCensus) {
    super("This plot is already being censused.");
    this.existingCensus = existingCensus;
  }
}
