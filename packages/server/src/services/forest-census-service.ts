import { ForestCensus } from "@ong-forestry/schema";
import ForestCensusModel from "db/models/forest-census";
import PlotCensusModel from "db/models/plot-census";
import PlotModel from "db/models/plot";
import { Op } from "sequelize";

export const createForestCensus = async (forestCensus: ForestCensus) => {
  // check for active census on this forest
  const activeCensuses = await ForestCensusModel.findAll({
    where: {
      forestId: { [Op.eq]: forestCensus.forestId },
      active: { [Op.eq]: true },
    },
  });
  if (activeCensuses.length > 0) {
    throw Error("An active forest census already exists.");
  }

  return await ForestCensusModel.create(forestCensus);
};

export const closeForestCensus = async (params: { forestId: string }) => {
  const { forestId } = params;

  // find active forest census
  const activeCensuses = await ForestCensusModel.findAll({
    where: { forestId: { [Op.eq]: forestId }, active: { [Op.eq]: true } },
  });
  if (activeCensuses.length > 1) {
    throw Error("Error: more than one active census");
  }
  if (activeCensuses.length < 1) {
    throw Error("There is no active forest census.");
  }

  // ensure all plots in this forest have approved plot censuses
  // select all plots in the forest
  const plots = await PlotModel.findAll({
    where: { forestId: { [Op.eq]: forestId } },
  });
  // select plot censuses in this forest census for each plot
  await Promise.all(
    plots.map(async (plot) => {
      const plotCensuses = await PlotCensusModel.findAll({
        where: {
          plotId: { [Op.eq]: plot.id },
          forestCensusId: { [Op.eq]: activeCensuses[0].id },
        },
      });
      if (plotCensuses.length == 0) {
        throw Error(
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
