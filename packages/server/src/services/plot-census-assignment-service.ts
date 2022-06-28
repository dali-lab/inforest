import { PlotCensusAssignment } from "@ong-forestry/schema";
import PlotCensusAssignmentModel from "db/models/plot-census-assignment";
import { Op } from "sequelize";
import { createPlotCensus, getPlots, getUsers } from "services";
import { CensusExistsError } from "errors";
import { PlotCensusStatuses } from "../enums";

const uuid = require("uuid4");

export const createAssignment = async (
  plotCensusAssignment: Pick<PlotCensusAssignment, "userId"> & {
    plotId: string;
  }
) => {
  // want to assign this user to this plot
  const { plotId, userId } = plotCensusAssignment;

  if (plotId == null) {
    throw new Error("You must specify a plot.");
  }
  const plot = await getPlots({ id: plotId });
  if (plot.length == 0) {
    throw new Error("This plot does not exist.");
  }

  if (userId == null) {
    throw new Error("You must specify a user.");
  }
  const user = await getUsers({ id: userId });
  if (user.length == 0) {
    throw new Error("This user does not exist.");
  }

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
    throw new Error("You cannot assign yourself to a pending plot.");
  }

  // check whether user is already assigned
  const existingAssignments = await getPlotCensusAssignments({
    userId,
    plotCensusId: plotCensus.id,
  });

  // if assignment exists, throw an error
  if (existingAssignments.length > 0) {
    throw new Error("You are already assigned to this plot.");
  }

  //finally, assign user to this plot census
  return await PlotCensusAssignmentModel.create({
    id: uuid(),
    plotCensusId: plotCensus.id,
    userId,
  });
};

interface PlotCensusAssignmentParams {
  plotCensusId?: string;
  userId?: string;
}

const constructQuery = (params: PlotCensusAssignmentParams) => {
  const { plotCensusId, userId } = params;
  const query: any = { where: {} };
  if (plotCensusId) {
    query.where.plotCensusId = {
      [Op.eq]: plotCensusId,
    };
  }
  if (userId) {
    query.where.userId = {
      [Op.eq]: userId,
    };
  }
  return query;
};

export const getPlotCensusAssignments = async (
  params: PlotCensusAssignmentParams
) => {
  return await PlotCensusAssignmentModel.findAll(constructQuery(params));
};
