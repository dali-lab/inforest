import { ForestCensus, PlotCensusStatuses } from "@ong-forestry/schema";
import ForestCensusModel from "db/models/forest-census";
import { Op } from "sequelize";
import { getPlotCensuses, getPlots } from "services";
import { getForests } from "./forest-service";

export const createForestCensus = async (forestCensus: ForestCensus) => {
  // check for active census on this forest
  const activeCensuses = await getForestCensuses({
    forestId: forestCensus.forestId,
    active: true,
  });
  if (activeCensuses.length > 0) {
    throw new Error("An active forest census already exists on this forest.");
  }

  return await ForestCensusModel.create(forestCensus);
};

export interface GetForestCensusesParams {
  forestId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetForestCensusesParams) => {
  const { forestId, active, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (forestId) {
    query.where.forestId = {
      [Op.eq]: forestId,
    };
  }
  if (active) {
    query.where.active = {
      [Op.eq]: active,
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

export const getForestCensuses = async (params: GetForestCensusesParams) => {
  const query = constructQuery(params);
  return await ForestCensusModel.findAll(query);
};

export const closeForestCensus = async (params: { forestId: string }) => {
  const { forestId } = params;

  if (forestId == null) {
    throw new Error("You must specify a forest.");
  }
  const forest = await getForests({ id: forestId });
  if (forest.length == 0) {
    throw new Error("This forest does not exist.");
  }

  // find active forest census
  const activeCensuses = await getForestCensuses({
    forestId,
    active: true,
  });
  if (activeCensuses.length > 1) {
    throw new Error("Error: more than one active census");
  }
  if (activeCensuses.length == 0) {
    throw new Error("There is no active forest census.");
  }

  // ensure all plots in this forest have approved plot censuses
  // select all plots in the forest
  const plots = await getPlots({ forestId });

  // select approved plot censuses in this forest census for each plot
  const plotPlotCensuses = await Promise.all(
    plots.map((plot) => {
      return getPlotCensuses({
        plotId: plot.id,
        forestCensusId: activeCensuses[0].id,
        statuses: [PlotCensusStatuses.Approved],
      });
    })
  );

  // for each plot ensure length of plot censuses is >0
  plotPlotCensuses.map((plotCensuses) => {
    if (plotCensuses.length == 0) {
      throw new Error(
        "All plots must be censused and approved before forest census can be closed"
      );
    }
  });

  return await ForestCensusModel.update(
    { active: false },
    { where: { id: { [Op.eq]: activeCensuses[0].id } } }
  );
};
