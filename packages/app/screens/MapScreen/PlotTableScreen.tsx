import { Ionicons } from "@expo/vector-icons";
import { Tree, TreeCensus } from "@ong-forestry/schema";
import { useNavigation } from "@react-navigation/native";
import { FC, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, TextVariants } from "../../components/Themed";
import Colors from "../../constants/Colors";
import useAppSelector from "../../hooks/useAppSelector";

type TableEntry = {
  //   plot: number;
  date?: string;
  tag?: string;
  species?: string;
  dbh?: number | string;
  x?: number | string;
  y?: number | string;
  codes?: string;
  flagged?: boolean | string;
};

const PlotTableScreen: FC = () => {
  const navigation = useNavigation();
  const { all: allPlots } = useAppSelector((state) => state.plots);
  const { all: allPlotCensuses, selected: selectedPlotCensusId } =
    useAppSelector((state) => state.plotCensuses);
  const { all: allTrees } = useAppSelector((state) => state.trees);
  const {
    all: allTreeCensuses,
    indices: { byPlotCensus },
  } = useAppSelector((state) => state.treeCensuses);
  const {
    all: allTreeCensusLabels,
    indices: { byTreeCensus },
  } = useAppSelector((state) => state.treeCensusLabels);

  const selectedPlotCensus = useMemo(
    () => allPlotCensuses[selectedPlotCensusId],
    [allPlotCensuses, selectedPlotCensusId]
  );
  console.log(selectedPlotCensus, selectedPlotCensusId);
  const selectedPlot = useMemo(
    () => allPlots[selectedPlotCensus.plotId],
    [allPlots, selectedPlotCensus]
  );
  const dataList: TableEntry[] = useMemo(() => {
    const entries: TableEntry[] = [];
    (byPlotCensus?.[selectedPlotCensusId] || []).forEach((censusId: string) => {
      const census: TreeCensus = allTreeCensuses[censusId];
      const tree: Tree = allTrees[census.treeId];
      const newEntry = {
        date:
          census?.createdAt &&
          `${new Date(census?.createdAt).toLocaleDateString()}`,
        tag: tree?.tag,
        species: tree?.speciesCode,
        dbh: census?.dbh,
        x: tree?.plotX,
        y: tree?.plotY,
        codes: byTreeCensus?.[census.id]
          ? Array.from(byTreeCensus[census.id] as Set<string>)
              .map((labelId) => allTreeCensusLabels[labelId].treeLabelCode)
              .join(", ")
          : "No Codes",
        flagged: census?.flagged,
      };
      entries.push(newEntry);
    });
    return entries.sort((a, b) => Number(a?.tag) - Number(b?.tag));
  }, [
    byPlotCensus,
    selectedPlotCensusId,
    allTreeCensuses,
    allTrees,
    byTreeCensus,
    allTreeCensusLabels,
  ]);

  return (
    <View style={{ width: "100%", paddingVertical: 12 }}>
      <View style={styles.headerRow}>
        <Ionicons
          name="ios-arrow-back"
          size={32}
          onPress={() => navigation.goBack()}
        />
        <View style={{ marginLeft: 12 }}>
          <Text variant={TextVariants.H1}>Plot #{selectedPlot.number}</Text>
        </View>
      </View>
      <FlatList
        style={{
          paddingLeft: 20,
          paddingRight: 54,
          width: "100%",
        }}
        ListHeaderComponent={
          <PlotTableRow
            isHeader
            item={{
              date: "Date",
              tag: "Tag",
              species: "Species",
              dbh: "DBH",
              x: "Plot X",
              y: "Plot Y",
              codes: "Codes",
              flagged: "Flagged",
            }}
          />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }} variant={TextVariants.H3}>
            No active censuses. Try adding a tree or censusing a pre-existing
            tree.
          </Text>
        }
        stickyHeaderIndices={[0]}
        data={dataList}
        renderItem={PlotTableRow}
      />
    </View>
  );
};

interface PlotTableRowProps {
  isHeader?: boolean;
  item: TableEntry;
}

const EMPTY_MESSAGE = "Not Set";

const PlotTableRow: FC<PlotTableRowProps> = ({ item, isHeader }) => {
  const { date, tag, species, dbh, x, y, codes, flagged } = item;
  return (
    <View
      style={[
        {
          flexDirection: "row",
          width: "100%",
        },
      ]}
    >
      <View
        style={[styles.tableCell, { justifyContent: "center", maxWidth: 36 }]}
      >
        {flagged === true && (
          <Ionicons
            name="flag-outline"
            color={Colors.error}
            size={16}
            style={{ marginTop: 2 }}
          />
        )}
      </View>
      <View style={[styles.tableCell, { minWidth: 48 }]}>
        <Text variant={isHeader ? TextVariants.H3 : TextVariants.Body}>
          {date || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text
          variant={isHeader ? TextVariants.H3 : TextVariants.Body}
          color={tag ? undefined : Colors.error}
        >
          {tag || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text
          variant={isHeader ? TextVariants.H3 : TextVariants.Body}
          color={species ? undefined : Colors.error}
        >
          {species || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text
          variant={isHeader ? TextVariants.H3 : TextVariants.Body}
          color={dbh ? undefined : Colors.error}
        >
          {dbh || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text variant={isHeader ? TextVariants.H3 : TextVariants.Body}>
          {x || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text variant={isHeader ? TextVariants.H3 : TextVariants.Body}>
          {y || EMPTY_MESSAGE}
        </Text>
      </View>
      <View style={[styles.tableCell]}>
        <Text variant={isHeader ? TextVariants.H3 : TextVariants.Body}>
          {codes || EMPTY_MESSAGE}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    flexDirection: "row",
    paddingVertical: 6,
  },
});

export default PlotTableScreen;
