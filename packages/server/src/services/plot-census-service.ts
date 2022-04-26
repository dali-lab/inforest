import { PlotCensus, PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusModel from "db/models/plot-census";
import PlotModel from "db/models/plot";
import TreeCensusModel from "db/models/tree-census";
import TreeModel from "db/models/tree";
import ForestCensusModel from "db/models/forest-census";
import { Op } from "sequelize";
import { CensusExistsError } from "errors";

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

  // there should only be one un-approved census per plot
  // this should never happen
  if (existingCensus.length > 1) {
    throw Error("Error: more than one open census on this plot");
  }

  if (existingCensus.length == 1) {
    throw new CensusExistsError(existingCensus[0]);
  }

  // find in-progress forest census on forest containing this plot
  const forestCensus = await ForestCensusModel.findAll({
    where: {
      forestId: { [Op.eq]: plot.forestId },
      active: { [Op.eq]: true },
    },
  });

  if (forestCensus.length > 1) {
    throw Error("Error: more than one open census on this forest");
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

export const submitForReview = async (args: { plotId: string }) => {
  const { plotId } = args;

  // find in-progress census on this plot
  const census: any = await PlotCensusModel.findAll({
    where: {
      plotId: { [Op.eq]: plotId },
      status: { [Op.eq]: PlotCensusStatuses.InProgress },
    },
  });

  if (census.length == 0) {
    throw Error("No ongoing census on this plot");
  }

  if (census.length > 1) {
    throw Error("Error: more than one open census on this plot");
  }

  // check that all trees on this plot have been censused
  // find all trees
  const trees = await TreeModel.findAll({
    where: { plotId: { [Op.eq]: plotId } },
  });
  // find tree censuses for each tree in this plot census
  await Promise.all(
    trees.map(async (tree) => {
      const treeCensuses = await TreeCensusModel.findAll({
        where: {
          treeTag: { [Op.eq]: tree.tag },
          plotCensusId: { [Op.eq]: census[0].id },
        },
      });
      if (treeCensuses.length == 0) {
        throw Error(
          "All trees must be censused before plot can be submitted for review"
        );
      }
    })
  );

  await PlotCensusModel.update(
    { status: PlotCensusStatuses.Pending },
    { where: { id: { [Op.eq]: census[0].id } } }
  );
};
