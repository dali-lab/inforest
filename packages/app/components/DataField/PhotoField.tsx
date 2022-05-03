import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  View,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ImageInfo,
  ImagePickerOptions,
  launchImageLibraryAsync,
} from "expo-image-picker";
import Colors from "../../constants/Colors";
import useAppSelector from "../../hooks/useAppSelector";
import { RootState } from "../../redux";
import { Text, TextVariants } from "../Themed";

const imageLibraryOptions: ImagePickerOptions = {
  base64: true,
};

interface PhotoFieldProps {
  onUpdate: (newValue: any[]) => void;
}

const PhotoField: React.FC<PhotoFieldProps> = ({ onUpdate }) => {
  const { all: allPurposes } = useAppSelector(
    (state: RootState) => state.treePhotoPurposes
  );
  const [photos, setPhotos] = useState<ImageInfo[]>([]);
  const addPhoto = useCallback(async () => {
    const photo = await launchImageLibraryAsync(imageLibraryOptions);
    if (!photo.cancelled) setPhotos((prev) => [...prev, photo]);
  }, [setPhotos]);
  const removePhoto = useCallback(
    async (url: string) => {
      setPhotos((prev) => prev.filter((photo) => photo.uri !== url));
    },
    [setPhotos]
  );
  useEffect(() => {
    onUpdate(photos);
  }, [photos]);
  const purposesOptions = useMemo(
    () =>
      Object.values(allPurposes).map((purpose) => ({
        label: purpose.name,
        value: purpose.name,
      })),
    [allPurposes]
  );

  return (
    <View style={styles.PhotoFieldWrapper}>
      <View style={styles.photoUploadContainer}>
        <Pressable style={styles.PhotoField} onPress={addPhoto}>
          <Ionicons
            name="cloud-upload-outline"
            size={28}
            style={{ marginVertical: 4 }}
          />
          <Text variant={TextVariants.Label} style={{ fontSize: 14 }}>
            Tap to Upload
          </Text>
        </Pressable>
      </View>
      <View style={styles.addedPhotosContainer}>
        {/* // @ts-ignore */}
        <FlatList
          data={photos}
          renderItem={(item) => (
            <PhotoItem item={item} removePhoto={removePhoto} />
          )}
          horizontal={true}
          keyExtractor={(_item, i) => i.toString()}
          style={{ paddingVertical: 12 }}
        ></FlatList>
      </View>
      {/* <Text variant={TextVariants.Label}>{title}</Text> */}
    </View>
  );
};

interface PhotoItemProps {
  item: ListRenderItemInfo<ImageInfo>;
  removePhoto: (url: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ item, removePhoto }) => {
  return (
    <View style={styles.photoWrapper}>
      <Image
        style={{
          width: 120,
          height: 90,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
        source={{
          uri: item.item.uri,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <DataField
              type={"SELECT"}
              label="Photo Label"
              style={{ flex: 1 }}
              placeholder="Select data codes here"
              moreInfo="A series of data codes describing specific aspects of the tree"
              onUpdate={(newValue) => {}}
              modalOnly
              pickerOptions={purposesOptions}
              editable
              noLabel
            /> */}
        <Text variant={TextVariants.Label} style={{ marginVertical: 4 }}>
          Label
        </Text>
      </View>
      <Pressable
        onPress={() => {
          removePhoto(item.item.uri);
        }}
        style={styles.photoRemove}
      >
        <Ionicons name="close-outline" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  PhotoFieldWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  photoUploadContainer: {
    borderRightWidth: 2,
    borderRightColor: "black",
    paddingHorizontal: 24,
  },
  addedPhotosContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginHorizontal: 12,
    backgroundColor: "#EAEAEA",
    flexDirection: "column",
    alignItems: "center",
    shadowColor: "black",
    shadowRadius: 4,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
  },
  PhotoField: {
    width: 120,
    height: 120,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#1F3527",
    borderWidth: 2,
    padding: 24,
  },
  photoRemove: {
    backgroundColor: Colors.error,
    height: 24,
    width: 24,
    borderRadius: 12,
    position: "absolute",
    top: -8,
    right: -8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PhotoField;
