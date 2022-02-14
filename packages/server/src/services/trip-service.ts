import { Trip } from "@ong-forestry/schema";
import TripModel from "db/models/trip";
import { Op } from "sequelize";

export const createTrip = async (trip: Trip) => {
  await TripModel.create(trip);
};

export interface GetTripsParams {
  id?: string;
  name?: string;

  forestId?: string;

  limit?: number;
  offset?: number;
}

export const getTrips = async (params: GetTripsParams) => {
  const { id, name, forestId, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  const trips = await TripModel.findAll(query);
  return trips;
};
