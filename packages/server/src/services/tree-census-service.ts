import { PlotCensusStatuses, TreeCensus } from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import TreeModel from "db/models/tree";
import PlotModel from "db/models/plot";
import PlotCensusModel from "db/models/plot-census";
import PlotCensusAssignmentModel from "db/models/plot-census-assignment";
import { Op } from "sequelize";

const getPlotCensus = async (treeCensus: Omit<TreeCensus, "plotCensusId">) => {
  // find tree being censused -> plot it's on -> active plot census
  const tree = await TreeModel.findOne({
    where: { tag: { [Op.eq]: treeCensus.treeTag } },
  });
  if (tree == null) {
    throw Error("Tree does not exist");
  }
  const plot = await PlotModel.findOne({
    where: { id: { [Op.eq]: tree.plotId } },
  });
  if (plot == null) {
    throw Error("Plot does not exist");
  }
  const plotCensuses = await PlotCensusModel.findAll({
    where: {
      plotId: { [Op.eq]: plot.id },
      status: { [Op.eq]: PlotCensusStatuses.InProgress },
    },
  });
  if (plotCensuses.length > 1) {
    throw Error("Error: more than one active census on this plot");
  }
  if (plotCensuses.length == 0) {
    throw Error("There is no active census on this plot");
  }
  const plotCensus = plotCensuses[0];

  // check that user is assigned to this plot census
  const assignment = await PlotCensusAssignmentModel.findOne({
    where: {
      plotCensusId: { [Op.eq]: plotCensus.id },
      userId: { [Op.eq]: treeCensus.authorId },
    },
  });
  if (assignment == null) {
    throw Error("You are not assigned to this plot.");
  }

  return plotCensus.id;
};

export const createTreeCensus = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">
) => {
  const plotCensusId = await getPlotCensus(treeCensus);
  // ^ throws error if census is not in_progress

  // check whether census on this tree in this plot census already exists
  const existingCensuses = await TreeCensusModel.findAll({
    where: {
      treeTag: { [Op.eq]: treeCensus.treeTag },
      plotCensusId: { [Op.eq]: plotCensusId },
    },
  });
  if (existingCensuses.length > 0) {
    throw Error("This tree has already been censused.");
  }

  return await TreeCensusModel.create({
    ...treeCensus,
    plotCensusId,
  });
};

export interface TreeCensusParams {
  treeTags?: string[];
  plotCensusId?: string;
  authorId?: string;
}

const constructQuery = (params: TreeCensusParams) => {
  const { treeTags, plotCensusId, authorId } = params;
  const query: any = { where: {} };
  if (treeTags) {
    query.where.treeTags = { [Op.in]: treeTags };
  }
  if (plotCensusId) {
    query.where.plotCensusId = { [Op.eq]: plotCensusId };
  }
  if (authorId) {
    query.where.authorId = { [Op.eq]: authorId };
  }
  return query;
};

export const getTreeCensuses = async (params: TreeCensusParams) => {
  return await TreeCensusModel.findAll(constructQuery(params));
};

export const editTreeCensuses = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">,
  params: TreeCensusParams
) => {
  // the author of the census is the person who last updated
  // frontend should include id of editor in the request body

  await getPlotCensus(treeCensus);
  // ^ throws error if census is not in_progress

  const query = constructQuery(params);
  return await TreeCensusModel.update(treeCensus, query);
};
