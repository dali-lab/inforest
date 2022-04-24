import { PlotCensus, PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusModel from "db/models/plot-census";
import ForestCensusModel from "db/models/forest-census";
import PlotModel from "db/models/plot";
import { Op } from "sequelize";

const uuid = require("uuid4");

export const createPlotCensus = async (plotId: string) => {
  // get this plot
  const plot = await PlotModel.findByPk(plotId);

  if (plot == null) {
    throw Error("This plot does not exist.");
  }

  // check for existing ongoing censuses
  const existingCensus: any = await PlotCensusModel.findAll({
    where: {
      plotId: { [Op.eq]: plotId },
      status: { [Op.not]: PlotCensusStatuses.Approved },
    },
  });
  if (existingCensus.length > 0) {
    throw Error("This plot is already being censused.");
  }

  // find in-progress forest census on forest containing this plot
  const forestCensus = await ForestCensusModel.findAll({
    where: {
      forestId: { [Op.eq]: plot.forestId },
      active: { [Op.eq]: true },
    },
  });

  if (forestCensus.length > 1) {
    throw Error(
      "Fatal error: more than one open census on this forest. Ask an administrator for assistance"
    );
  }

  // if it doesn't exist, cannot create plot census
  if (forestCensus.length == 0) {
    throw Error("This forest is not currently being censused");
  }

  // check for existing approved censuses from this generation
  const approvedCensus: any = await PlotCensusModel.findAll({
    where: {
      plotId: { [Op.eq]: plotId },
      forestCensusId: { [Op.eq]: forestCensus[0].id },
      status: { [Op.eq]: PlotCensusStatuses.Approved },
    },
  });
  if (approvedCensus.length > 0) {
    throw Error("This plot has already been censused.");
  }

  // create in-progress plot census
  return await PlotCensusModel.create({
    id: uuid(),
    plotId,
    status: PlotCensusStatuses.InProgress,
    forestCensusId: forestCensus[0].id,
  });
};
