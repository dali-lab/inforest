import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useCameraPermissions,
  ImagePickerOptions,
  launchCameraAsync,
} from "expo-image-picker";
import useAppSelector from "../../../hooks/useAppSelector";
import { RootState } from "../../../redux";
import { Text, TextVariants } from "../../Themed";
import FieldWrapper from "../FieldWrapper";
import PhotoItem from "./PhotoItem";
import { TreeCensus, TreePhoto } from "@ong-forestry/schema";
import useAppDispatch from "../../../hooks/useAppDispatch";
import {
  locallyDeleteTreePhoto,
  locallyCreateTreePhoto,
  locallyUpdateTreePhoto,
  createTreePhoto,
  deleteTreePhoto,
  updateTreePhoto,
} from "../../../redux/slices/treePhotoSlice";
import { useIsConnected } from "react-native-offline";

const imageLibraryOptions: ImagePickerOptions = {
  base64: true,
};

export type PhotoFieldProps = {
  census: TreeCensus;
};

const PhotoField: React.FC<PhotoFieldProps> = ({ census }) => {
  const dispatch = useAppDispatch();
  const [status, requestPermission] = useCameraPermissions();

  const isConnected = useIsConnected();

  const { all: allPurposes } = useAppSelector(
    (state: RootState) => state.treePhotoPurposes
  );
  const {
    all: allPhotos,
    indices: { byTreeCensus },
  } = useAppSelector((state: RootState) => state.treePhotos);
  const photos = useMemo(() => {
    const treePhotos: TreePhoto[] = [];
    byTreeCensus?.[census.id] &&
      byTreeCensus[census.id].forEach((photoId) => {
        treePhotos.push(allPhotos[photoId]);
      });
    return treePhotos;
  }, [byTreeCensus, allPhotos, census]);
  const addPhoto = useCallback(async () => {
    if (!status) await requestPermission();
    const photo = await launchCameraAsync(imageLibraryOptions);
    if (!photo?.cancelled && photo?.base64) {
      const parsedPhoto = {
        thumbUrl: photo?.uri || "",
        fullUrl: "",
        treeCensusId: census.id,
        purposeName: null,
        buffer: photo.base64,
      };
      dispatch(
        isConnected
          ? createTreePhoto(parsedPhoto)
          : locallyCreateTreePhoto(parsedPhoto)
      );
    }
  }, [census.id, dispatch, requestPermission, status, isConnected]);
  const removePhoto = useCallback(
    async (id: string) => {
      dispatch(isConnected ? deleteTreePhoto(id) : locallyDeleteTreePhoto(id));
    },
    [dispatch, isConnected]
  );
  const setPhotoPurpose = useCallback(
    async (photo: TreePhoto, purposeName: string) => {
      dispatch(
        isConnected
          ? updateTreePhoto({ ...photo, purposeName })
          : locallyUpdateTreePhoto({ ...photo, purposeName })
      );
    },
    [dispatch, isConnected]
  );
  const purposesOptions = useMemo(
    () =>
      Object.values(allPurposes).map((purpose) => ({
        label: purpose.name,
        value: purpose.name,
      })),
    [allPurposes]
  );
  return (
    <FieldWrapper
      label="Upload Photos"
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <View style={styles.photoUploadContainer}>
        <Pressable style={styles.photoAdder} onPress={addPhoto}>
          <Ionicons
            name="cloud-upload-outline"
            size={28}
            style={{ marginVertical: 4, color: "#333333" }}
          />
          <Text
            variant={TextVariants.Label}
            style={{ fontSize: 14, color: "#333333" }}
          >
            Tap to Upload
          </Text>
        </Pressable>
      </View>
      <View style={styles.addedPhotosContainer}>
        <FlatList
          data={photos}
          renderItem={(item) => (
            <PhotoItem
              item={item}
              removePhoto={removePhoto}
              options={purposesOptions}
              setPurpose={(newValue) => {
                setPhotoPurpose(item.item, newValue);
              }}
            />
          )}
          horizontal={true}
          keyExtractor={(_item, i) => i.toString()}
          style={{ paddingVertical: 12 }}
        ></FlatList>
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  photoUploadContainer: {
    borderRightWidth: 2,
    borderRightColor: "#666666",
    paddingHorizontal: 24,
  },
  addedPhotosContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 140,
  },
  photoAdder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#666666",
    borderWidth: 2,
    padding: 24,
  },
});

export default PhotoField;
