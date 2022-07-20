import { Tree } from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";
import { getPlots } from "services";

export const bulkUpsertTrees = async (trees: Tree[]) => {
  // return await TreeModel.bulkCreate(trees, {
  //   updateOnDuplicate: Object.keys(TreeModel.rawAttributes) as (keyof Tree)[],
  // });
  const added = [];
  for (const tree of trees) {
    added.push(
      new Promise<[Tree, any]>((resolve, reject) =>
        TreeModel.upsert(tree)
          .then((val) => resolve(val))
          .catch((err) => {
            console.log("Error when adding Tree ", err);
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

export const bulkDeleteTrees = async (ids: string[]) => {
  // return await TreeModel.bulkCreate(trees, {
  //   updateOnDuplicate: Object.keys(TreeModel.rawAttributes) as (keyof Tree)[],
  // });
  const deleted = [];
  for (const id of ids) {
    deleted.push(
      new Promise<string>((resolve, reject) => {
        TreeModel.destroy({ where: { id } })
          .then(() => {
            resolve(id);
          })
          .catch((err) => {
            console.log(`Error when deleting tree id ${id}: `, err);
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

export const createTree = async (tree: Tree) => {
  // ensure tag unique in this forest
  // find plot tree is in
  const plots = await getPlots({
    id: tree.plotId,
  });
  if (plots.length == 0) {
    throw new Error("Plot does not exist");
  }

  // find other plots in the same forest
  const allPlots = await getPlots({
    forestId: plots[0].forestId,
  });
  // get ids of plots
  const plotIds = allPlots.map((plot) => plot.id);

  // get trees with this tag in the plots in the same forest as this tree
  const treesWithTag = await getTrees({
    tags: [tree.tag],
    plotIds: plotIds,
  });
  if (treesWithTag.length > 0) {
    throw new Error("There is already a tree with this tag in this forest.");
  }
  return await TreeModel.create(tree);
};

export interface TreeParams {
  id?: string;
  ids?: string[];
  tags?: string[];
  plotIds?: string[];
  speciesCodes?: string[];

  latMin?: number;
  latMax?: number;
  longMin?: number;
  longMax?: number;

  plotXMin?: number;
  plotXMax?: number;
  plotYMin?: number;
  plotYMax?: number;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeParams) => {
  const {
    id,
    ids,
    tags,
    plotIds,
    latMin,
    latMax,
    longMin,
    longMax,
    plotXMin,
    plotXMax,
    plotYMin,
    plotYMax,
    speciesCodes,
    limit = 30,
    offset = 0,
  } = params;
  const query: any = {
    where: {},
    returning: true,
  };
  if (id) {
    query.where.id = { [Op.eq]: id };
  }
  if (ids) {
    query.where.id = {
      [Op.in]: ids,
    };
  }
  if (tags) {
    query.where.tag = {
      [Op.in]: tags,
    };
  }
  if (plotIds) {
    query.where.plotId = {
      [Op.in]: plotIds,
    };
  }
  if (speciesCodes) {
    query.where.speciesCode = {
      [Op.in]: speciesCodes,
    };
  }
  if (latMin) {
    query.where.latitude = {
      [Op.gte]: latMin,
    };
  }
  if (latMax) {
    query.where.latitude = {
      [Op.lte]: latMax,
    };
  }
  if (longMin) {
    query.where.longitude = {
      [Op.gte]: longMin,
    };
  }
  if (longMax) {
    query.where.longitude = {
      [Op.lte]: longMax,
    };
  }
  if (plotXMin) {
    query.where.plotX = {
      [Op.gte]: plotXMin,
    };
  }
  if (plotXMax) {
    query.where.plotX = {
      [Op.lte]: plotXMax,
    };
  }
  if (plotYMin) {
    query.where.plotY = {
      [Op.gte]: plotYMin,
    };
  }
  if (plotYMax) {
    query.where.plotY = {
      [Op.lte]: plotYMax,
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

export const editTree = async (tree: Partial<Tree>, params: TreeParams) => {
  const result = (
    await TreeModel.update(tree, constructQuery(params))
  )[1][0].get();
  return result;
};

export const getTrees = async (params: TreeParams) => {
  const query = constructQuery(params);
  return await TreeModel.findAll({
    ...query,
    include: [{ model: TreeCensusModel, as: "censuses" }],
  });
};

export const deleteTrees = async (params: TreeParams) => {
  const query = constructQuery(params);
  return await TreeModel.destroy(query);
};
