import * as utm from "utm";
import { Tree, TreeCensus, Plot, PlotCensus } from "@ong-forestry/schema";
import { createTree, editTree, getTrees, TreeParams } from "./tree-service";
import { createTreeCensus } from "./tree-census-service";
import { getPlots } from "./plot-service";
import { getPlotCensuses } from "./plot-census-service";

export interface SheetRowParams {
  plotNumber: string,
  treeCensusUpdatedAt: Date,
  treeTag: string,
  treeSpeciesCode: string,
  treeCensusDbh: number,
  treePlotX: number,
  treePlotY: number,
  treeCensusLabelCode: string,
  treeSpeciesFamily: string,
  treeSpeciesType: string,
}

export interface SheetRowOutput {
  tree: Tree,
  treeCensus: TreeCensus
}

export const addSheetRow = async (
  rowData: SheetRowParams, 
  forestId: string, 
  forestCensusId: string,
  authorId: string
) => {
  try {
    const queryPlots: Plot[] = await getPlots({
      number: rowData.plotNumber,
      forestId,
    });
    if(queryPlots.length === 0) {
      throw new Error(
        "No plot found."
      );
    }
    const plotData: Plot = queryPlots[0];
    const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
      plotData.latitude,
      plotData.longitude
    );
    const { latitude, longitude } = utm.toLatLon(
      easting + rowData.treePlotX,
      northing - rowData.treePlotY,
      zoneNum,
      zoneLetter
    );
    const queryTrees: Tree[] = await getTrees({
      tags: [rowData.treeTag],
      plotIds: [plotData.id],
    })
    const newTree: Partial<Tree> = ({
      tag: rowData.treeTag,
      plotId: plotData.id,
      plot: plotData,
      latitude,
      longitude,
      plotX: rowData.treePlotX,
      plotY: rowData.treePlotY,
      speciesCode: rowData.treeSpeciesCode,
    });
    let tree : Tree;
    console.log('here0');
    if(queryTrees.length === 0) {
      tree = await createTree(newTree as Tree);
    } else {
      const treeParams: TreeParams = ({
        id: queryTrees[0].id,
      })
      tree = await editTree(newTree, treeParams)
    }

    console.log('here1');
    const queryPlotCensuses: PlotCensus[] = await getPlotCensuses({
      forestCensusId: forestCensusId,
      plotId: plotData.id,
    });
    if(queryPlotCensuses.length === 0) {
      throw new Error(
        "No plot census found."
      );
    }
    const plotCensusData: PlotCensus = queryPlotCensuses[0];
    const newTreeCensus: Partial<TreeCensus> =({
      treeId: tree.id,
      tree,
      dbh: rowData.treeCensusDbh,
      flagged: false,
      plotCensus: plotCensusData,
      plotCensusId: plotCensusData.id,
      authorId: authorId,
    });
    const treeCensus = await createTreeCensus(newTreeCensus as TreeCensus);

    return {
      tree,
      treeCensus
    } as SheetRowOutput;
  } catch(e : any) {
    console.error(e);
    throw e;
  }
}

export interface SheetInput {
  Quadrat: string,
  Date: string,
  Tag: string,
  Species: string,
  DBH: string,
  local_x: string,
  local_y: string,
  Code: string,
  Family: string,
  Type: string,
}

export const bulkUpsertSheetRows = async (
  sheet: SheetInput[], 
  forestId: string,
  forestCensusId: string,
  authorId: string
) => {
  const added = [];
  for (let i = 0; i < sheet.length; i += 1) {
    const rowData = {
      plotNumber: sheet[i].Quadrat,
      treeCensusUpdatedAt: new Date(sheet[i].Date),
      treeTag: sheet[i].Tag,
      treeSpeciesCode: sheet[i].Species,
      treeCensusDbh: parseInt(sheet[i].DBH),
      treePlotX: parseInt(sheet[i].local_x),
      treePlotY: parseInt(sheet[i].local_y),
      treeCensusLabelCode: sheet[i].Code,
      treeSpeciesFamily: sheet[i].Family,
      treeSpeciesType: sheet[i].Type,
    }
    
    added.push(
      new Promise<SheetRowOutput>((resolve, reject) =>
        addSheetRow(rowData, forestId, forestCensusId, authorId)
          .then((val) => resolve(val))
          .catch((err) => {
            console.log(`Error while uploading data`, err);
              reject(err);
          })
      )
    );
  }

  const result = await Promise.allSettled(added);
  return result;
}
