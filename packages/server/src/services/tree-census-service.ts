import { PlotCensusStatuses, TreeCensus } from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";
import {
  getPlotCensusAssignments,
  getPlotCensuses,
  getPlots,
  getTrees,
} from "services";
import { PlotCensus } from "db/models";

const validatePlotCensus = async (treeCensusData: Partial<TreeCensus>) => {
  // get all data about whatever was passed about the tree census
  const treeCensus = (await getTreeCensuses(treeCensusData))[0];

  // find tree being censused -> plot it's on -> active plot census
  const trees = await getTrees({
    ids: [treeCensus.treeId],
  });
  if (trees.length == 0) {
    throw new Error("Tree does not exist");
  }

  const plots = await getPlots({
    id: trees[0].plotId,
  });
  if (plots.length == 0) {
    throw new Error("Plot does not exist");
  }

  const plotCensuses = await getPlotCensuses({
    plotId: plots[0].id,
    statuses: [PlotCensusStatuses.InProgress],
  });
  if (plotCensuses.length > 1) {
    throw new Error("Error: more than one active census on this plot");
  }
  if (plotCensuses.length == 0) {
    throw new Error("There is no active census on this plot");
  }

  // check that user is assigned to this plot census
  const assignment = await getPlotCensusAssignments({
    plotCensusId: plotCensuses[0].id,
    userId: treeCensus.authorId,
  });
  if (assignment.length == 0) {
    throw new Error("You are not assigned to this plot.");
  }

  return plotCensuses[0].id;
};

export const createTreeCensus = async (treeCensus: TreeCensus) => {
  const plotCensusId = await validatePlotCensus(treeCensus);
  // ^ throws error if census is not in_progress

  // check whether census on this tree in this plot census already exists
  const existingCensuses = await getTreeCensuses({
    treeIds: [treeCensus.treeId],
    plotCensusId: plotCensusId,
  });
  if (existingCensuses.length > 0) {
    throw new Error("This tree has already been censused.");
  }

  return await TreeCensusModel.create({
    ...treeCensus,
    plotCensusId,
  });
};

export interface TreeCensusParams {
  id?: string;
  treeIds?: string[];
  plotCensusId?: string;
  authorId?: string;
  flagged?: boolean;
}

const constructQuery = (params: TreeCensusParams) => {
  const { id, treeIds, plotCensusId, authorId, flagged } = params;
  const query: any = { where: {} };
  if (id) {
    query.where.treeId = { [Op.eq]: id };
  }
  if (treeIds) {
    query.where.treeId = { [Op.in]: treeIds };
  }
  if (plotCensusId) {
    query.where.plotCensusId = { [Op.eq]: plotCensusId };
  }
  if (authorId) {
    query.where.authorId = { [Op.eq]: authorId };
  }
  if (flagged) {
    query.where.flagged = { [Op.eq]: flagged };
  }

  return query;
};

export const getTreeCensuses = async (params: TreeCensusParams) => {
  const query = constructQuery(params);
  return await TreeCensusModel.findAll({
    ...query,
    // include: [{ model: TreeModel, as: "treeId" }],
    include: [
      {
        model: PlotCensus,
        through: {
          attributes: ["status"],
        },
      },
    ],
  });
};

export const editTreeCensuses = async (
  treeCensus: Partial<TreeCensus>,
  params: TreeCensusParams
) => {
  await validatePlotCensus({ ...params, ...treeCensus });
  // ^ throws error if census is not in_progress

  const query = constructQuery(params);
  return await TreeCensusModel.update(treeCensus, query);
};
