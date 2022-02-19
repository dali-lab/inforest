import { Plot } from "@ong-forestry/schema";
import PlotModel from "db/models/plot";
import { Op } from "sequelize";

export const createPlot = async (plot: Plot) => {
  await PlotModel.create(plot);
};

export interface GetPlotsParams {
  number?: number;
  name?: string;

  forestId?: string;

  latMin?: number;
  latMax?: number;
  longMin?: number;
  longMax?: number;

  limit?: number;
  offset?: number;
}

export const getPlots = async (params: GetPlotsParams) => {
  const {
    number,
    name,
    forestId,
    latMin,
    latMax,
    longMin,
    longMax,
    limit = 30,
    offset = 0,
  } = params;
  const query: any = {
    where: {},
  };
  if (number) {
    query.where.number = {
      [Op.eq]: number,
    };
  }
  if (name) {
    query.where.name = {
      [Op.eq]: name,
    };
  }
  if (forestId) {
    query.where.forestId = {
      [Op.eq]: forestId,
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  const plots = await PlotModel.findAll(query);
  return plots;
};