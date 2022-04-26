import { Tree } from "@ong-forestry/schema";
import { TreeCensus } from "db/models";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";

export const createTrees = async (tree: Tree) => {
  return await TreeModel.create(tree);
};

export interface GetTreesParams {
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

  dbhMin?: number;
  dbhMax?: number;

  heightMin?: number;
  heightMax?: number;

  tripId?: string;
  authorId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetTreesParams) => {
  const {
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
    dbhMin,
    dbhMax,
    heightMin,
    heightMax,
    speciesCodes,
    tripId,
    authorId,
    limit = 30,
    offset = 0,
  } = params;
  const query: any = {
    where: {},
  };
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
    query.where.latitude = {
      [Op.gte]: latMin,
    };
  }
  if (latMax) {
    query.where.latitude = {
      [Op.lte]: latMax,
    };
  }
  if (longMin) {
    query.where.longitude = {
      [Op.gte]: longMin,
    };
  }
  if (longMax) {
    query.where.longitude = {
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
  if (dbhMin) {
    query.where.dbh = {
      [Op.gte]: dbhMin,
    };
  }
  if (dbhMax) {
    query.where.dbh = {
      [Op.lte]: dbhMax,
    };
  }
  if (heightMin) {
    query.where.height = {
      [Op.gte]: heightMin,
    };
  }
  if (heightMax) {
    query.where.height = {
      [Op.lte]: heightMax,
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
  return await TreeModel.findAll({
    ...query,
    include: TreeCensus,
  });
};

export const deleteTrees = async (params: GetTreesParams) => {
  const query = constructQuery(params);
  return await TreeModel.destroy(query);
};
