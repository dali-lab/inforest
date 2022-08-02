import * as utm from "utm";
import { Tree, TreeCensus, Plot, PlotCensus } from "@ong-forestry/schema";
import { createTree, editTree, getTrees, TreeParams } from "./tree-service";
import { createTreeCensus, editTreeCensus, getTreeCensuses, TreeCensusParams } from "./tree-census-service";
import { createPlotCensus, editPlotCensusStatus } from "./plot-census-service";
import { getPlots } from "./plot-service";
import { getPlotCensuses } from "./plot-census-service";
import { PlotCensusStatuses } from "../enums";

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
  treeCensus: TreeCensus,
  plotCensus: PlotCensus
}

export const adjustPlotCensusRows = async (
  rowData: SheetRowParams, 
  forestId: string, 
  forestCensusId: string,
  authorId: string,
  rowIdx: number
) => {
  // Check if plot exists
  const queryPlots: Plot[] = await getPlots({
    number: rowData.plotNumber,
    forestId,
  });
  if(queryPlots.length === 0) { 
    throw new Error(
      "No plot found."
    );
  }

  // Extract info from Plot
  const plotData: Plot = queryPlots[0];
  // Check if plot census exists
  const queryPlotCensuses: PlotCensus[] = await getPlotCensuses({
    forestCensusId: forestCensusId,
    plotId: plotData.id,
  });
  if(queryPlotCensuses.length === 0) { // If plot census does not exist, create it
    await createPlotCensus(plotData.id, forestCensusId);
  }
  else if(queryPlotCensuses[0].status !== PlotCensusStatuses.InProgress) { // If plot census is not editable, change status
    await editPlotCensusStatus(PlotCensusStatuses.InProgress, queryPlotCensuses[0].id);
  }
}

export const addSheetRow = async ( // Plots, forest, and forest census must already be created
  rowData: SheetRowParams, 
  forestId: string, 
  forestCensusId: string,
  authorId: string,
  rowIdx: number
) => {
  try {
    // Check if plot exists
    const queryPlots: Plot[] = await getPlots({
      number: rowData.plotNumber,
      forestId,
    });
    if(queryPlots.length === 0) { 
      throw new Error(
        "No plot found."
      );
    }

    // Extract info from Plot
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
    if(queryTrees.length === 0) { // If tree does not exist, create it
      tree = await createTree(newTree as Tree);
    } else { // If tree already exists, edit existing it
      const treeParams: TreeParams = ({ 
        id: queryTrees[0].id,
      });
      tree = await editTree(newTree, treeParams);
    }

    // Check if plot census exists
    const queryPlotCensuses: PlotCensus[] = await getPlotCensuses({
      forestCensusId: forestCensusId,
      plotId: plotData.id,
    });
    let plotCensus : PlotCensus = queryPlotCensuses[0]; // must exist from earlier
    const queryTreeCensuses: TreeCensus[] = await getTreeCensuses({
      treeId: tree.id,
      plotCensusId: plotCensus.id,
    });

    const newTreeCensus: Partial<TreeCensus> =({
      treeId: tree.id,
      tree,
      dbh: rowData.treeCensusDbh,
      flagged: false,
      plotCensus: plotCensus,
      plotCensusId: plotCensus.id,
      authorId: authorId,
    });
    let treeCensus : TreeCensus;
    if(queryTreeCensuses.length === 0) { // If tree census does not exist, create it
      treeCensus = await createTreeCensus(newTreeCensus as TreeCensus);
    } else {  // If tree census already exists, edit existing copy
      const treeCensusParams: TreeCensusParams = ({
        id: queryTreeCensuses[0].id,
        forestCensusId,
      })
      treeCensus = await editTreeCensus(newTreeCensus as TreeCensus, treeCensusParams);
    }
    plotCensus = await editPlotCensusStatus(PlotCensusStatuses.Approved, plotCensus.id); // Uploaded data is assumed to be implicitly approved

    return {
      tree,
      treeCensus,
      plotCensus,
    } as SheetRowOutput;
  } catch(e : any) {
    console.error(e);
    throw new Error(`On row ${rowIdx}: ` + e.message + '; upload data: ' + JSON.stringify(rowData)); // rowIdx is the row on the spreadsheet
  }
}

export interface SheetInput {
  Quadrat: string,
  Date: string,
  Tag: string,
  Species: string,
  DBH: number,
  local_x: number,
  local_y: number,
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
  for (let i = 0; i < sheet.length; i += 1) { // We must first configure plot census in sync. Otherwise the same plot census 
    const rowData = {                         // could accidently be created twice, which shouldn't be allowed.
      plotNumber: sheet[i].Quadrat,
      treeCensusUpdatedAt: new Date(sheet[i].Date),
      treeTag: sheet[i].Tag,
      treeSpeciesCode: sheet[i].Species,
      treeCensusDbh: sheet[i].DBH,
      treePlotX: sheet[i].local_x,
      treePlotY: sheet[i].local_y,
      treeCensusLabelCode: sheet[i].Code,
      treeSpeciesFamily: sheet[i].Family,
      treeSpeciesType: sheet[i].Type,
    }
    try {
      await adjustPlotCensusRows(rowData, forestId, forestCensusId, authorId, i + 1);
    }
    catch(e: any) {
      console.log(e);
    }
  }

  const added = [];
  for (let i = 0; i < sheet.length; i += 1) { // We can execute each row async
    const rowData = {
      plotNumber: sheet[i].Quadrat,
      treeCensusUpdatedAt: new Date(sheet[i].Date),
      treeTag: sheet[i].Tag,
      treeSpeciesCode: sheet[i].Species,
      treeCensusDbh: sheet[i].DBH,
      treePlotX: sheet[i].local_x,
      treePlotY: sheet[i].local_y,
      treeCensusLabelCode: sheet[i].Code,
      treeSpeciesFamily: sheet[i].Family,
      treeSpeciesType: sheet[i].Type,
    }
    
    added.push(
      new Promise<SheetRowOutput>((resolve, reject) =>
        addSheetRow(rowData, forestId, forestCensusId, authorId, i + 1)
          .then((val) => resolve(val))
          .catch((err) => {
            console.log(`Error while uploading data`, err);
            reject(err.message);
          })
      )
    );
  }

  const result = await Promise.allSettled(added); // Do not return until each row is finished executing
  return result;
}
