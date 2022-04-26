import { PlotCensusAssignment, PlotCensusStatuses } from "@ong-forestry/schema";
import PlotCensusAssignmentModel from "db/models/plot-census-assignment";
import PlotCensusModel from "db/models/plot-census";
import { Op } from "sequelize";
import { createPlotCensus } from "./plot-census-service";

const uuid = require("uuid4");

export const createAssignment = async (plotAssignment: {
  plotId: string;
  userId: string;
}) => {
  // want to assign this user to this plot
  const { plotId, userId } = plotAssignment;

  // does this plot already have an open census?
  const existingCensus: any = await PlotCensusModel.findAll({
    where: {
      plotId: { [Op.eq]: plotId },
      status: { [Op.not]: PlotCensusStatuses.Approved },
    },
  });

  // there should only be one un-approved census per plot
  // this should never happen
  if (existingCensus.length > 1) {
    throw Error(
      "Fatal error: more than one open census on this plot. Ask an administrator for assistance"
    );
  }

  if (existingCensus.length > 0) {
    // if one open census, check whether it is pending or in progress
    if (existingCensus[0].status == PlotCensusStatuses.InProgress) {
      // if in progress, check whether user is already assigned
      const existingAssignments: any = await PlotCensusAssignmentModel.findAll({
        where: {
          userId: { [Op.eq]: userId },
          plotCensusId: { [Op.eq]: existingCensus[0].id },
        },
      });

      // if assignment exists, throw an error
      if (existingAssignments.length > 0) {
        throw Error("You are already assigned to this plot.");
      } else {
        // if not, assign user to this plot census
        return await PlotCensusAssignmentModel.create({
          id: uuid(),
          plotCensusId: existingCensus[0].id,
          userId,
        });
      }
    } else {
      // if pending / something else?, cannot assign self to census
      throw Error("You cannot assign yourself to a pending plot.");
    }
  } else {
    // if not, create a new census for this plot
    const plotCensus = await createPlotCensus(plotId);

    // assign user to this new census
    return await PlotCensusAssignmentModel.create({
      id: uuid(),
      plotCensusId: plotCensus.id,
      userId,
    });
  }
};
