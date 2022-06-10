import { ForestCensus, PlotCensusStatuses } from "@ong-forestry/schema";
import ForestCensusModel from "db/models/forest-census";
import { Op } from "sequelize";
import { getPlotCensuses, getPlots } from "services";

export const createForestCensus = async (
  forestCensus: Omit<ForestCensus, "active">
) => {
  // check for active census on this forest
  const activeCensuses = await getForestCensuses({
    forestId: forestCensus.forestId,
    active: true,
  });
  if (activeCensuses.length > 0) {
    throw new Error("An active forest census already exists on this forest.");
  }

  return await ForestCensusModel.create({ ...forestCensus, active: true });
};

export interface GetForestCensusesParams {
  id?: string;
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

export const closeForestCensus = async (params: Pick<ForestCensus, "id">) => {
  const { id } = params;

  if (id == null) {
    throw new Error("You must specify a census.");
  }

  // find forest census
  const censuses = await getForestCensuses({
    id,
  });
  if (censuses.length == 0) {
    throw new Error("This census does not exist.");
  }
  if (!censuses[0].active) {
    throw new Error("This census is already closed.");
  }

  // ensure all plots in this forest have approved plot censuses
  // select all plots in the forest
  const plots = await getPlots({ forestId: censuses[0].forestId });

  // select approved plot censuses in this forest census for each plot
  const plotPlotCensuses = await Promise.all(
    plots.map((plot) => {
      return getPlotCensuses({
        plotId: plot.id,
        forestCensusId: censuses[0].id,
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
    { where: { id: { [Op.eq]: censuses[0].id } } }
  );
};
