import { TreeSpecies } from "@ong-forestry/schema";
import { TreeSpeciesTypes } from "@ong-forestry/schema/src/tree";
import express from "express";
import { requireAuth } from "services/auth-service";
import { getTreeSpecies } from "services/tree-species-service";

const treeSpeciesRouter = express.Router()

const parseParams = (query: any) => ({
    code: query.code as string,
    codes: query.codes as string[],
    name: query.name as string,
    family:query.family as string,
    genus: query.genus as string,
    commonName:query.commonName as string,
    type:query.type as TreeSpeciesTypes,
    limit: parseInt(query.limit as string),
    offset: parseInt(query.offset as string),
  });

treeSpeciesRouter.get<{}, any, TreeSpecies>('/', requireAuth, async(req,res)=>{
    try {
        const species = await getTreeSpecies(parseParams(req.query));
        res.status(200).json(species);
      } catch (e: any) {
        console.error(e);
        res.status(500).send(e?.message ?? "Unknown error.");
      }
})

export {treeSpeciesRouter}