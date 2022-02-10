import { Tree } from "@ong-forestry/schema";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";

export const createTreeEntry = async (tree: Tree) => {
  await TreeModel.create(tree);
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

  limit?: number;
  offset?: number;
}
export const getTrees = async (params: GetTreesParams) => {
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  const trees = await TreeModel.findAll(query);
  return trees;
};
