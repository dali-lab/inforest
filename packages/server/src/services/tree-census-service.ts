import { PlotCensusStatuses, TreeCensus } from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import { Op } from "sequelize";
import {
  getPlotCensusAssignments,
  getPlotCensuses,
  getPlots,
  getTrees,
} from "services";
import { PlotCensus } from "db/models";

export const bulkUpsertTreeCensuses = async (treeCensuses: TreeCensus[]) => {
  return await TreeCensusModel.bulkCreate(treeCensuses, {
    updateOnDuplicate: Object.keys(
      TreeCensusModel.rawAttributes
    ) as (keyof TreeCensus)[],
  });
};

const validatePlotCensus = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">
) => {
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

  // // check that user is assigned to this plot census
  // const assignment = await getPlotCensusAssignments({
  //   plotCensusId: plotCensuses[0].id,
  //   userId: treeCensus.authorId,
  // });
  // if (assignment.length == 0) {
  //   throw new Error("You are not assigned to this plot.");
  // }

  return plotCensuses[0].id;
};

export const createTreeCensus = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">
) => {
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
  ids?: string[];
  treeIds?: string[];
  plotCensusId?: string;
  forestId?: string;
  authorId?: string;
  flagged?: boolean;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeCensusParams) => {
  const { id, ids, treeIds, plotCensusId, authorId, flagged, limit, offset } =
    params;
  const query: any = { where: {}, returning: true };
  if (id) {
    query.where.id = { [Op.eq]: id };
  }
  if (ids) {
    query.where.id = { [Op.in]: ids };
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }

  return query;
};

export const getTreeCensuses = async (params: TreeCensusParams) => {
  const query = constructQuery(params);
  return await TreeCensusModel.findAll({
    ...query,
    include: [
      {
        model: PlotCensus,
        attributes: ["status"],
      },
    ],
  });
};

export const editTreeCensus = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">,
  params: TreeCensusParams
) => {
  const result = (
    await TreeCensusModel.update(treeCensus, constructQuery(params))
  )[1][0].get();

  return result;
};

export const deleteTreeCensuses = async (params: TreeCensusParams) => {
  const result = await TreeCensusModel.destroy(constructQuery(params));
  return result;
};
