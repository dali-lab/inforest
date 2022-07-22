import { TreeCensus } from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import { Op } from "sequelize";
import {
  getPlotCensusAssignments,
  getPlotCensuses,
  getPlots,
  getTrees,
} from "services";
import {
  PlotCensus,
  TreeCensusLabel,
  TreeLabel,
  TreePhoto,
  Tree,
} from "db/models";
import { PlotCensusStatuses } from "../enums";

export const bulkUpsertTreeCensuses = async (treeCensuses: TreeCensus[]) => {
  // return await TreeCensusModel.bulkCreate(treeCensuses, {
  //   updateOnDuplicate: Object.keys(
  //     TreeCensusModel.rawAttributes
  //   ) as (keyof TreeCensus)[],
  // });
  const added = [];
  for (const treeCensus of treeCensuses) {
    // temp upload fix
    if (!treeCensus || !("dbh" in treeCensus)) continue;
    added.push(
      new Promise<[TreeCensus, any]>((resolve, reject) =>
        TreeCensusModel.upsert(treeCensus)
          .then((val) => resolve(val))
          .catch((err) => {
            console.log(`Error while adding tree census`, err);
            reject(err);
          })
      )
    );
  }
  const result = await Promise.allSettled(added);
  return result.reduce((prev: string[], curr) => {
    if (curr.status === "fulfilled") return prev.concat([curr.value[0].id]);
    return prev;
  }, []);
};

export const bulkDeleteTreeCensuses = async (ids: string[]) => {
  // return await TreeModel.bulkCreate(trees, {
  //   updateOnDuplicate: Object.keys(TreeModel.rawAttributes) as (keyof Tree)[],
  // });
  const deleted = [];
  for (const id of ids) {
    deleted.push(
      new Promise<string>((resolve, reject) => {
        TreeCensusModel.destroy({ where: { id } })
          .then(() => {
            resolve(id);
          })
          .catch((err) => {
            console.log(`Error while deleting tree census id ${id}:`, err);
            reject(err);
          });
      })
    );
  }
  const result = await Promise.allSettled(deleted);
  return result.reduce((prev: string[], curr) => {
    if (curr.status === "fulfilled") return prev.concat([curr.value]);
    return prev;
  }, []);
};

//TODO: revisit this
const validateTreeCensus = async (treeCensusData: Partial<TreeCensus>) => {
  // get all data about whatever was passed about the tree census
  const treeCensus = (await getTreeCensuses({ id: treeCensusData.id }))[0];
  // find tree being censused -> plot it's on -> active plot census
  const trees = await getTrees({
    ids: [treeCensus.treeId],
  });
  // if (trees.length == 0) {
  //   throw new Error("Tree does not exist");
  // }

  const plots = await getPlots({
    id: trees[0].plotId,
  });
  // if (plots.length == 0) {
  //   throw new Error("Plot does not exist");
  // }

  const plotCensuses = await getPlotCensuses({
    plotId: plots[0].id,
    statuses: [PlotCensusStatuses.InProgress],
  });
  if (plotCensuses.length > 1) {
    throw new Error("Error: more than one active census on this plot");
  }
  if (plotCensuses.length == 0) {
    throw new Error("There is no active census on this plot");
  }

  // // check that user is assigned to this plot census
  // const assignment = await getPlotCensusAssignments({
  //   plotCensusId: plotCensuses[0].id,
  //   userId: treeCensus.authorId,
  // });
  // if (assignment.length == 0) {
  //   throw new Error("You are not assigned to this plot.");
  // }

  return plotCensuses[0].id;
};

export const createTreeCensus = async (treeCensus: TreeCensus) => {
  // const plotCensusId = await validateTreeCensus(treeCensus);
  // ^ throws error if census is not in_progress

  // check whether census on this tree in this plot census already exists
  const existingCensuses = await getTreeCensuses({
    treeIds: [treeCensus.treeId],
    plotCensusId: treeCensus.plotCensusId,
  });
  if (existingCensuses.length > 0) {
    throw new Error("This tree has already been censused.");
  }

  const newCensus = await TreeCensusModel.create(treeCensus);

  await Tree.update(
    { initCensusId: newCensus.id },
    { where: { id: newCensus.treeId, initCensusId: null } }
  );
  return newCensus;
};

export interface TreeCensusParams {
  id?: string;
  ids?: string[];
  treeId?: string;
  treeIds?: string[];
  plotCensusId?: string;
  forestId?: string;
  authorId?: string;
  flagged?: boolean;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeCensusParams) => {
  const {
    id,
    ids,
    treeId,
    treeIds,
    plotCensusId,
    authorId,
    flagged,
    limit,
    offset,
  } = params;
  const query: any = { where: {}, returning: true };
  if (id) {
    query.where.id = { [Op.eq]: id };
  }
  if (ids) {
    query.where.id = { [Op.in]: ids };
  }
  if (treeId) {
    query.where.treeId = { [Op.eq]: treeId };
  }
  if (treeIds) {
    query.where.treeId = { [Op.in]: treeIds };
  }
  if (plotCensusId) {
    query.where.plotCensusId = { [Op.eq]: plotCensusId };
  }
  if (authorId) {
    query.where.authorId = { [Op.eq]: authorId };
  }
  if (flagged) {
    query.where.flagged = { [Op.eq]: flagged };
  }
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }

  return query;
};

export const getTreeCensuses = async (params: TreeCensusParams) => {
  const query = constructQuery(params);
  return await TreeCensusModel.findAll({
    ...query,
    include: [
      {
        model: PlotCensus,
        attributes: ["status"],
      },
      {
        model: TreePhoto,
      },
      { model: TreeLabel },
    ],
  });
};

export const editTreeCensus = async (
  treeCensus: Omit<TreeCensus, "plotCensusId">,
  params: TreeCensusParams
) => {
  await validateTreeCensus({ ...params, ...treeCensus });
  const result = (
    await TreeCensusModel.update(treeCensus, constructQuery(params))
  )[1][0].get();

  return result;
};

export const deleteTreeCensuses = async (params: TreeCensusParams) => {
  const result = await TreeCensusModel.destroy(constructQuery(params));
  return result;
};
