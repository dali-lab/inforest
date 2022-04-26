import { PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusAssignmentModel from "db/models/plot-census-assignment";
import { Op } from "sequelize";
import { createPlotCensus } from "./plot-census-service";
import { CensusExistsError } from "errors";

const uuid = require("uuid4");

export const createAssignment = async (plotAssignment: {
  plotId: string;
  userId: string;
}) => {
  // want to assign this user to this plot
  const { plotId, userId } = plotAssignment;

  // need it to live in this scope
  var plotCensus;

  // try to create a new census on this plot or get existing one
  try {
    plotCensus = await createPlotCensus(plotId);
  } catch (e) {
    if (e instanceof CensusExistsError) {
      // get the census
      plotCensus = e.existingCensus;
    } else {
      throw e;
    }
  }

  // if pending / something else?, cannot assign self to census
  if (plotCensus.status != PlotCensusStatuses.InProgress) {
    throw Error("You cannot assign yourself to a pending plot.");
  }

  // check whether user is already assigned
  const existingAssignments: any = await PlotCensusAssignmentModel.findAll({
    where: {
      userId: { [Op.eq]: userId },
      plotCensusId: { [Op.eq]: plotCensus.id },
    },
  });

  // if assignment exists, throw an error
  if (existingAssignments.length > 0) {
    throw Error("You are already assigned to this plot.");
  }

  //finally, assign user to this plot census
  return await PlotCensusAssignmentModel.create({
    id: uuid(),
    plotCensusId: plotCensus.id,
    userId,
  });
};
