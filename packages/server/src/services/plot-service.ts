import { Plot } from "@ong-forestry/schema";
import PlotModel from "db/models/plot";
import { Op } from "sequelize";

export const createPlot = async (plot: Plot) => {
  return await PlotModel.create(plot);
};

export interface GetPlotsParams {
  id?: string;

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
    id,
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
    limit,
    offset,
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
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
