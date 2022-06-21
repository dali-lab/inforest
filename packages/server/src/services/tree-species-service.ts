import { TreeSpeciesTypes } from "@ong-forestry/schema/src/tree";
import TreeSpeciesModel from "db/models/tree-species";
import { Op } from "sequelize";

export interface TreeSpeciesParams {
  code?: string;
  codes?: string[];

  name?: string;
  family?: string;
  genus?: string;
  commonName?: string;
  type?: TreeSpeciesTypes;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeSpeciesParams) => {
  const { code, codes, name, family, genus, commonName, type, limit, offset } =
    params;
  const query: any = {
    where: {},
  };
  if (code) {
    query.where.code = {
      [Op.eq]: code,
    };
  }
  if (codes) {
    query.where.code = {
      [Op.in]: codes,
    };
  }
  if (name) {
    query.where.name = {
      [Op.eq]: name,
    };
  }
  if (family) {
    query.where.family = {
      [Op.eq]: family,
    };
  }
  if (genus) {
    query.where.genus = {
      [Op.eq]: genus,
    };
  }
  if (commonName) {
    query.where.commonName = {
      [Op.eq]: commonName,
    };
  }
  if (type) {
    query.where.type = {
      [Op.eq]: type,
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

export const getTreeSpecies = async (params: TreeSpeciesParams) => {
  const query = constructQuery(params);
  return await TreeSpeciesModel.findAll(query);
};
