import { Plot } from "@ong-forestry/schema";
import PlotModel from "db/models/plot";
import { Op } from "sequelize";

export const createPlot = async (plot: Plot) => {
  return await PlotModel.create(plot);
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

const constructQuery = (params: GetPlotsParams) => {
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  return query;
};

export const editPlots = async (
  plot: Partial<Plot>,
  params: GetPlotsParams
) => {
  const query = constructQuery(params);
  return await PlotModel.update(plot, query);
};

export const getPlots = async (params: GetPlotsParams) => {
  const query = constructQuery(params);
  return await PlotModel.findAll(query);
};

export const deletePlots = async (params: GetPlotsParams) => {
  const query = constructQuery(params);
  return await PlotModel.destroy(query);
};
