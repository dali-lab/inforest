import { Tree } from "@ong-forestry/schema";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";
import { getPlots } from "./plot-service";

export const createTree = async (tree: Tree) => {
  // ensure tag unique in this forest
  // find plot tree is in
  const plots = await getPlots({
    id: tree.plotId,
  });
  if (plots.length == 0) {
    throw new Error("Plot does not exist");
  }

  // find other plots in the same forest
  const allPlots = await getPlots({
    forestId: plots[0].forestId,
  });
  // get ids of plots
  const plotIds = allPlots.map((plot) => plot.id);

  // get trees with this tag in the plots in the same forest as this tree
  const treesWithTag = await getTrees({
    tags: [tree.tag],
    plotIds: plotIds,
  });
  if (treesWithTag.length > 0) {
    throw new Error("There is already a tree with this tag in this forest.");
  }

  return await TreeModel.create(tree);
};

export interface GetTreesParams {
  ids?: string[];
  tags?: string[];
  plotIds?: string[];
  speciesCodes?: string[];

  latMin?: number;
  latMax?: number;
  longMin?: number;
  longMax?: number;

  plotXMin?: number;
  plotXMax?: number;
  plotYMin?: number;
  plotYMax?: number;

  tripId?: string;
  authorId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetTreesParams) => {
  const {
    ids,
    tags,
    plotIds,
    latMin,
    latMax,
    longMin,
    longMax,
    plotXMin,
    plotXMax,
    plotYMin,
    plotYMax,
    speciesCodes,
    tripId,
    authorId,
    limit = 30,
    offset = 0,
  } = params;
  const query: any = {
    where: {},
  };
  if (ids) {
    query.where.id = {
      [Op.in]: ids,
    };
  }
  if (tags) {
    query.where.tag = {
      [Op.in]: tags,
    };
  }
  if (plotIds) {
    query.where.plotId = {
      [Op.in]: plotIds,
    };
  }
  if (speciesCodes) {
    query.where.speciesCode = {
      [Op.in]: speciesCodes,
    };
  }
  if (latMin) {
    query.where.lat = {
      [Op.gte]: latMin,
    };
  }
  if (latMax) {
    query.where.lat = {
      [Op.lte]: latMax,
    };
  }
  if (longMin) {
    query.where.long = {
      [Op.gte]: longMin,
    };
  }
  if (longMax) {
    query.where.long = {
      [Op.lte]: longMax,
    };
  }
  if (plotXMin) {
    query.where.plotX = {
      [Op.gte]: plotXMin,
    };
  }
  if (plotXMax) {
    query.where.plotX = {
      [Op.lte]: plotXMax,
    };
  }
  if (plotYMin) {
    query.where.plotY = {
      [Op.gte]: plotYMin,
    };
  }
  if (plotYMax) {
    query.where.plotY = {
      [Op.lte]: plotYMax,
    };
  }
  if (tripId) {
    query.where.tripId = {
      [Op.eq]: tripId,
    };
  }
  if (authorId) {
    query.where.authorId = {
      [Op.eq]: authorId,
    };
  }
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  return query;
};

export const editTrees = async (
  tree: Partial<Tree>,
  params: GetTreesParams
) => {
  const query = constructQuery(params);
  return await TreeModel.update(tree, query);
};

export const getTrees = async (params: GetTreesParams) => {
  const query = constructQuery(params);
  return await TreeModel.findAll(query);
};

export const deleteTrees = async (params: GetTreesParams) => {
  const query = constructQuery(params);
  return await TreeModel.destroy(query);
};
