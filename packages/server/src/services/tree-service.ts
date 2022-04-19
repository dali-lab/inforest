import { Tree } from "@ong-forestry/schema";
import { TreeCensus } from "db/models";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";

export const createTrees = async (tree: Tree) => {
  return await TreeModel.create(tree);
};

export interface GetTreesParams {
  tags?: string[];
  plotNumbers?: number[];
  speciesCodes?: string[];
  statusNames?: string[];

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
    plotNumbers,
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
    statusNames,
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
  if (plotNumbers) {
    query.where.plotNumber = {
      [Op.in]: plotNumbers,
    };
  }
  if (speciesCodes) {
    query.where.speciesCode = {
      [Op.in]: speciesCodes,
    };
  }
  if (statusNames) {
    query.where.statusName = {
      [Op.in]: statusNames,
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
