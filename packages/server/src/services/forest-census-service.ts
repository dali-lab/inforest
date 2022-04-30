import { ForestCensus } from "@ong-forestry/schema";
import ForestCensusModel from "db/models/forest-census";
import { Op } from "sequelize";
import { getPlotCensuses } from "./plot-census-service";
import { getPlots } from "./plot-service";

export const createForestCensus = async (forestCensus: ForestCensus) => {
  // check for active census on this forest
  const activeCensuses = await getForestCensuses({
    forestId: forestCensus.forestId,
    active: true,
  });
  if (activeCensuses.length > 0) {
    throw new Error("An active forest census already exists.");
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

  // find active forest census
  const activeCensuses = await getForestCensuses({
    forestId,
    active: true,
  });
  if (activeCensuses.length > 1) {
    throw new Error("Error: more than one active census");
  }
  if (activeCensuses.length < 1) {
    throw new Error("There is no active forest census.");
  }

  // ensure all plots in this forest have approved plot censuses
  // select all plots in the forest
  const plots = await getPlots({ forestId });
  // select plot censuses in this forest census for each plot
  await Promise.all(
    plots.map(async (plot) => {
      const plotCensuses = await getPlotCensuses({
        plotId: plot.id,
        forestCensusId: activeCensuses[0].id,
      });

      if (plotCensuses.length == 0) {
        throw new Error(
          "All plots must be censused before forest census can be closed"
        );
      }
    })
  );

  return await ForestCensusModel.update(
    { active: false },
    { where: { id: { [Op.eq]: activeCensuses[0].id } } }
  );
};
