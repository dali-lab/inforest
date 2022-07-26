import { isEqual } from "lodash";
import { FC, useCallback, useMemo } from "react";
import { View } from "react-native";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import { clearTreeCensusLabelFailed } from "../redux/slices/treeCensusLabelSlice";
import { clearTreeCensusFailed } from "../redux/slices/treeCensusSlice";
import { clearTreePhotoFailed } from "../redux/slices/treePhotoSlice";
import { clearTreeFailed } from "../redux/slices/treeSlice";
import AppButton from "./AppButton";
import AppModal from "./AppModal";
import { Text, TextVariants } from "./Themed";

const emptyFailedObj = {
  trees: {
    drafts: [],
    deletions: [],
  },
  censuses: {
    drafts: [],
    deletions: [],
  },
  photos: {
    drafts: [],
    deletions: [],
  },
  labels: {
    drafts: [],
    deletions: [],
  },
};

type FailedObj = {
  drafts: string[];
  deletions: string[];
};

const FailedModal: FC = () => {
  const dispatch = useAppDispatch();
  const {
    all: allTrees,
    failedDrafts: treeFailedDrafts,
    failedDeletions: treeFailedDeletions,
  } = useAppSelector((state) => state.trees);
  const {
    all: allCensuses,
    failedDrafts: censusFailedDrafts,
    failedDeletions: censusFailedDeletions,
  } = useAppSelector((state) => state.treeCensuses);
  const {
    all: allPhotos,
    failedDrafts: photoFailedDrafts,
    failedDeletions: photoFailedDeletions,
  } = useAppSelector((state) => state.treePhotos);
  const {
    all: allLabels,
    failedDrafts: labelFailedDrafts,
    failedDeletions: labelFailedDeletions,
  } = useAppSelector((state) => state.treeCensusLabels);
  const syncState = useAppSelector((state) => state.sync);
  const getTreeNumFromTree = useCallback(
    (treeId) => allTrees?.[treeId]?.number || treeId,
    // (treeId) => treeId,
    [allTrees]
  );
  const getTreeNumFromCensus = useCallback(
    (censusId) => getTreeNumFromTree(allCensuses?.[censusId]?.treeId),
    [getTreeNumFromTree, allCensuses]
  );
  const getTreeNumFromPhoto = useCallback(
    (photoId) => getTreeNumFromCensus(allPhotos?.[photoId].censusId),
    [getTreeNumFromCensus, allPhotos]
  );
  const getTreeNumFromLabel = useCallback(
    (labelId) => getTreeNumFromCensus(allLabels?.[labelId].censusId),
    [getTreeNumFromCensus, allLabels]
  );
  const failedObj = useMemo(
    () => ({
      trees: {
        drafts: (treeFailedDrafts || [])
          .map((id: string) => getTreeNumFromTree(id))
          .filter((num: number) => !!num),
        deletions: (treeFailedDeletions || [])
          .map((id: string) => getTreeNumFromTree(id))
          .filter((num: number) => !!num),
      },
      censuses: {
        drafts: (censusFailedDrafts || [])
          .map((id: string) => getTreeNumFromCensus(id))
          .filter((num: number) => !!num),
        deletions: (censusFailedDeletions || [])
          .map((id: string) => getTreeNumFromCensus(id))
          .filter((num: number) => !!num),
      },
      photos: {
        drafts: (photoFailedDrafts || [])
          .map((id: string) => getTreeNumFromPhoto(id))
          .filter((num: number) => !!num),
        deletions: (photoFailedDeletions || [])
          .map((id: string) => getTreeNumFromPhoto(id))
          .filter((num: number) => !!num),
      },
      labels: {
        drafts: (labelFailedDrafts || [])
          .map((id: string) => getTreeNumFromLabel(id))
          .filter((num: number) => !!num),
        deletions: (labelFailedDeletions || [])
          .map((id: string) => getTreeNumFromLabel(id))
          .filter((num: number) => !!num),
      },
    }),
    [
      treeFailedDrafts,
      treeFailedDeletions,
      getTreeNumFromTree,
      censusFailedDrafts,
      censusFailedDeletions,
      getTreeNumFromCensus,
      photoFailedDrafts,
      photoFailedDeletions,
      getTreeNumFromPhoto,
      labelFailedDrafts,
      labelFailedDeletions,
      getTreeNumFromLabel,
    ]
  );
  const closeModal = useCallback(() => {
    dispatch(clearTreeFailed());
    dispatch(clearTreeCensusFailed());
    dispatch(clearTreeCensusLabelFailed());
    dispatch(clearTreePhotoFailed());
  }, []);
  return (
    <AppModal
      setVisible={closeModal}
      visible={
        syncState?.loadingTasks?.size === 0 &&
        !isEqual(failedObj, emptyFailedObj)
      }
      modalSize={"large"}
    >
      <View style={{ flexDirection: "column" }}>
        <Text variant={TextVariants.H2}>Sync Failure</Text>
        <Text variant={TextVariants.Body} style={{ marginBottom: 12 }}>
          Uploading failed for the following entity&apos;s tree numbers. Check
          these trees and verify that the information you inputted is correct.
          If it is, then these failures are likely due to a server issue. In
          that case, copy down the failed data, delete it, and then re-input the
          tree census with internet connection.
        </Text>
        {!isEqual(failedObj.trees, emptyFailedObj.trees) && (
          <FailedContainer title="Failed Trees" failedObj={failedObj.trees} />
        )}
        {!isEqual(failedObj.censuses, emptyFailedObj.censuses) && (
          <FailedContainer
            title="Failed Censuses"
            failedObj={failedObj.censuses}
          />
        )}
        {!isEqual(failedObj.photos, emptyFailedObj.photos) && (
          <FailedContainer title="Failed Photos" failedObj={failedObj.photos} />
        )}
        {!isEqual(failedObj.labels, emptyFailedObj.labels) && (
          <FailedContainer title="Failed Labels" failedObj={failedObj.labels} />
        )}
        <AppButton onPress={closeModal} type={"COLOR"}>
          OK
        </AppButton>
      </View>
    </AppModal>
  );
};

interface FailedContainerProps {
  title: string;
  failedObj: FailedObj;
}

const FailedContainer: FC<FailedContainerProps> = ({ title, failedObj }) => (
  <View style={{ flexDirection: "column", marginBottom: 12 }}>
    <Text variant={TextVariants.H3}>{title}</Text>
    <FailedRow title="Drafts" failedIds={failedObj.drafts} />
    <FailedRow title="Deletions" failedIds={failedObj.deletions} />
  </View>
);

interface FailedRowProps {
  failedIds: string[];
  title: string;
}

const FailedRow: FC<FailedRowProps> = ({ failedIds, title }) => (
  <View style={{ flexDirection: "column" }}>
    <Text variant={TextVariants.Label}>{title}</Text>
    <Text>{failedIds.join(", ")}</Text>
  </View>
);
export default FailedModal;
