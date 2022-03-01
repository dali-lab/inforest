import { Trip } from "@ong-forestry/schema";
import TripModel from "db/models/trip";
import { Op } from "sequelize";

export const createTrip = async (trip: Trip) => {
  return await TripModel.create(trip);
};

export interface GetTripsParams {
  id?: string;
  name?: string;

  forestId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetTripsParams) => {
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
  return query;
};

export const editTrips = async (
  trip: Partial<Trip>,
  params: GetTripsParams
) => {
  const query = constructQuery(params);
  return await TripModel.update(trip, query);
};

export const getTrips = async (params: GetTripsParams) => {
  const query = constructQuery(params);
  return await TripModel.findAll(query);
};

export const deleteTrips = async (params: GetTripsParams) => {
  const query = constructQuery(params);
  return await TripModel.destroy(query);
};
