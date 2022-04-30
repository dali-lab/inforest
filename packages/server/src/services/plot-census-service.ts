import { PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusModel from "db/models/plot-census";
import PlotModel from "db/models/plot";
import PlotCensusAssignmentModel from "db/models/plot-census-assignment";
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

export interface PlotCensusParams {
  forestCensusId?: string;
  plotId?: string;

  userId?: string;
  status?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: PlotCensusParams) => {
  const { forestCensusId, plotId, status, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (forestCensusId) {
    query.where.forestCensusId = {
      [Op.eq]: forestCensusId,
    };
  }
  if (plotId) {
    query.where.plotId = {
      [Op.eq]: plotId,
    };
  }
  if (status) {
    query.where.status = {
      [Op.eq]: status,
    };
  }
  return query;
};

export const getPlotCensuses = async (params: PlotCensusParams) => {
  const query = constructQuery(params);
  var plotCensuses = await PlotCensusModel.findAll(query);

  // search by user assigned to this plot census
  if (params.userId) {
    // search the plot assignment table for plot censuses this user is assigned to
    const userCensuses = (
      await PlotCensusAssignmentModel.findAll({
        where: { userId: { [Op.eq]: params.userId } },
      })
    ).map((plotCensusAssignment) => plotCensusAssignment.plotCensusId);

    // intersect found plot censuses with plot censuses assigned to this user
    plotCensuses = plotCensuses.filter((plotCensus) =>
      userCensuses.includes(plotCensus.id)
    );
  }

  // need to handle limit and offset manually
  if (params.offset) {
    plotCensuses = plotCensuses.filter(
      (plotCensus, index) => index >= (params.offset ?? 0)
    );
  }
  if (params.limit) {
    plotCensuses = plotCensuses.filter((plotCensus, index) =>
      params.limit ? index < params.limit : true
    );
  }

  return plotCensuses;
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
          treeId: { [Op.eq]: tree.id },
          plotCensusId: { [Op.eq]: census[0].id },
        },
      });
      if (treeCensuses.length > 1) {
        throw Error("Error: two censuses on the same tree");
      }
      if (treeCensuses.length == 0) {
        throw Error(
          "All trees must be censused before plot can be submitted for review"
        );
      }
      if (treeCensuses[0].flagged == true) {
        throw Error(
          "Cannot submit plot census for review if flagged trees exist"
        );
      }
    })
  );

  await PlotCensusModel.update(
    { status: PlotCensusStatuses.Pending },
    { where: { id: { [Op.eq]: census[0].id } } }
  );
};
