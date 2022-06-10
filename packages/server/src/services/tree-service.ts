import {
  MembershipRoles,
  PlotCensusStatuses,
  Tree,
} from "@ong-forestry/schema";
import TreeCensusModel from "db/models/tree-census";
import TreeModel from "db/models/tree";
import { Op } from "sequelize";
import { getPlotCensuses, getPlots, getTreeCensuses } from "services";
import { AuthUser } from "../util";

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
  };
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

export const editTrees = async (tree: Partial<Tree>, params: TreeParams) => {
  const query = constructQuery(params);
  return await TreeModel.update(tree, query);
};

export const getTrees = async (params: TreeParams) => {
  const query = constructQuery(params);
  return await TreeModel.findAll({
    ...query,
    include: [{ model: TreeCensusModel, as: "censuses" }],
  });
};

export const deleteTrees = async (params: TreeParams, user?: AuthUser) => {
  if (!params.ids) {
    throw new Error("You must specify the ids of trees to be deleted.");
  }
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validate = async (id: string) => {
    // check that tree was created in this plot census
    // find tree censuses on this tree
    const treeCensuses = await getTreeCensuses({ treeIds: params.ids });
    if (treeCensuses.length > 1) {
      throw new Error(
        "You can only delete trees in the census they were created in."
      );
    }

    // check that plot census the only tree census is on is not approved
    const plotCensus = (
      await getPlotCensuses({ id: treeCensuses[0].plotCensusId })
    )[0];
    if (plotCensus.status == PlotCensusStatuses.Approved) {
      throw new Error("You cannot delete trees on approved plots.");
    }

    // check that tree was created by this user or that user is admin
    if (
      !(
        treeCensuses[0].authorId == user.id ||
        user.role == MembershipRoles.Admin
      )
    ) {
      throw new Error("You cannot delete someone else's tree.");
    }
  };

  // repeat check for each tree
  await Promise.all(
    params.ids.map((id) => {
      return validate(id);
    })
  );

  await TreeModel.destroy({ where: { id: { [Op.in]: params.ids } } });
};
