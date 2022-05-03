import { PlotCensus, PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusModel from "db/models/plot-census";
import { Op } from "sequelize";
import { CensusExistsError } from "errors";
import {
  getPlots,
  getForestCensuses,
  getPlotCensusAssignments,
  getTrees,
  getTreeCensuses,
} from "services";

const uuid = require("uuid4");

export const createPlotCensus = async (plotId: string) => {
  // get this plot
  const plots = await getPlots({ id: plotId });
  if (plots.length == 0) {
    throw new Error("This plot does not exist.");
  }

  // check for existing ongoing censuses
  const existingCensuses = await getPlotCensuses({
    plotId,
    status: PlotCensusStatuses.Approved,
  });
  if (existingCensuses.length > 1) {
    throw new Error("Error: more than one open census on this plot");
  }

  if (existingCensuses.length == 1) {
    throw new CensusExistsError(existingCensuses[0]);
  }

  // find in-progress forest census on forest containing this plot
  const forestCensus = await getForestCensuses({
    forestId: plots[0].forestId,
    active: true,
  });
  if (forestCensus.length > 1) {
    throw new Error("Error: more than one open census on this forest");
  }

  // if it doesn't exist, cannot create plot census
  if (forestCensus.length == 0) {
    throw new Error("This forest is not currently being censused");
  }

  // check for existing approved censuses from this generation
  const approvedCensus = await getPlotCensuses({
    plotId,
    forestCensusId: forestCensus[0].id,
    status: PlotCensusStatuses.Approved,
  });
  if (approvedCensus.length > 0) {
    throw new Error("This plot has already been censused.");
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
  id?: string;

  forestCensusId?: string;
  plotId?: string;

  userId?: string;
  status?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: PlotCensusParams) => {
  const { id, forestCensusId, plotId, status, limit, offset } = params;
  const query: any = {
    where: {},
    limit,
    offset,
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
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
      await getPlotCensusAssignments({ userId: params.userId })
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

export const submitForReview = async (args: Pick<PlotCensus, "plotId">) => {
  const { plotId } = args;

  // find in-progress census on this plot
  const census = await getPlotCensuses({
    plotId: plotId,
    status: PlotCensusStatuses.InProgress,
  });
  if (census.length > 1) {
    throw new Error("Error: more than one open census on this plot");
  }

  if (census.length == 0) {
    throw new Error("No ongoing census on this plot");
  }

  // check that all trees on this plot have been censused
  // find all trees
  const trees = await getTrees({
    plotIds: [plotId],
  });

  // find tree censuses for each tree in this plot census
  const treeTreeCensuses = await Promise.all(
    trees.map(async (tree) => {
      return getTreeCensuses({
        treeIds: [tree.id],
        plotCensusId: census[0].id,
      });
    })
  );

  // check number of tree censuses for each tree
  treeTreeCensuses.map((treeCensuses) => {
    if (treeCensuses.length > 1) {
      throw new Error("Error: more than one census on the same tree");
    }

    if (treeCensuses.length == 0) {
      throw new Error(
        "All trees must be censused before plot can be submitted for review"
      );
    }
  });

  return await PlotCensusModel.update(
    { status: PlotCensusStatuses.Pending },
    { where: { id: { [Op.eq]: census[0].id } } }
  );
};

export const approve = async (args: Pick<PlotCensus, "id">) => {
  const { id } = args;

  // find census
  const census = await getPlotCensuses({
    id: id,
  });
  if (census.length == 0) {
    throw new Error("This census is not awaiting review.");
  }

  // check that all trees on this plot have been censused
  // find all trees
  const trees = await getTrees({
    plotIds: [census[0].plotId],
  });

  // find tree censuses for each tree in this plot census
  const treeTreeCensuses = await Promise.all(
    trees.map(async (tree) => {
      return getTreeCensuses({
        treeIds: [tree.id],
        plotCensusId: id,
      });
    })
  );

  // make sure no tree censuses are flagged
  treeTreeCensuses.map((treeCensuses) => {
    if (treeCensuses.length > 1) {
      throw new Error("Error: more than one census on the same tree");
    }

    if (treeCensuses.length == 0) {
      throw new Error(
        "All trees must be censused before plot census can be approved"
      );
    }

    if (treeCensuses[0].flagged) {
      throw new Error("Cannot approve plot census if flagged trees exist");
    }
  });

  return await PlotCensusModel.update(
    { status: PlotCensusStatuses.Pending },
    { where: { id: { [Op.eq]: census[0].id } } }
  );
};
