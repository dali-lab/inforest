import React, { useState, useCallback, useEffect, useMemo } from "react";
import { FlatList, Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImagePickerOptions, launchImageLibraryAsync } from "expo-image-picker";
import useAppSelector from "../../../hooks/useAppSelector";
import { RootState } from "../../../redux";
import { Text, TextVariants } from "../../Themed";
import FieldWrapper from "../FieldWrapper";
import PhotoItem from "./PhotoItem";
import { TreeCensus, TreePhoto } from "@ong-forestry/schema";

const imageLibraryOptions: ImagePickerOptions = {
  base64: true,
};

export type PhotoFieldProps = {
  onUpdate: (newValue: TreePhoto[]) => void;
  census: TreeCensus;
};

const PhotoField: React.FC<PhotoFieldProps> = ({ onUpdate, census }) => {
  const { all: allPurposes } = useAppSelector(
    (state: RootState) => state.treePhotoPurposes
  );
  const [photos, setPhotos] = useState<Record<string, TreePhoto>>(
    census?.photos?.reduce(
      (prev, photo) => ({ ...prev, [photo.fullUrl]: photo }),
      {}
    ) || {}
  );
  const addedUrls = useMemo(() => Object.keys(photos), [photos]);
  const addPhoto = useCallback(async () => {
    const photo = await launchImageLibraryAsync(imageLibraryOptions);
    if (!photo?.cancelled) {
      if (photo.uri in addedUrls) {
        alert("This photo has already been uploaded.");
        return;
      }
      const parsedPhoto: TreePhoto = {
        id: "",
        thumbUrl: "",
        fullUrl: photo?.uri,
        treeCensusId: census.id,
        purposeName: "",
      };
      setPhotos((prev) => ({ ...prev, [photo.uri]: parsedPhoto }));
    }
  }, [addedUrls, setPhotos, census.id]);
  const removePhoto = useCallback(
    async (url: string) => {
      setPhotos((prev) => {
        const { [url]: _removedPhoto, ...remainingPhotos } = prev;
        return remainingPhotos;
      });
    },
    [setPhotos]
  );
  const setPhotoPurpose = useCallback(
    async (url: string, purpose: string) => {
      setPhotos((prev) => ({
        ...prev,
        [url]: { ...prev[url], purposeName: purpose },
      }));
    },
    [setPhotos]
  );
  const photoList = useMemo(() => Object.values(photos), [photos]);
  useEffect(() => {
    onUpdate(photoList);
  }, [photoList]);
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
            style={{ marginVertical: 4 }}
          />
          <Text variant={TextVariants.Label} style={{ fontSize: 14 }}>
            Tap to Upload
          </Text>
        </Pressable>
      </View>
      <View style={styles.addedPhotosContainer}>
        <FlatList
          data={photoList}
          renderItem={(item) => (
            <PhotoItem
              item={item}
              removePhoto={removePhoto}
              options={purposesOptions}
              setPurpose={(newValue) => {
                setPhotoPurpose(item.item.fullUrl, newValue);
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
    borderRightColor: "black",
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
    borderColor: "#1F3527",
    borderWidth: 2,
    padding: 24,
  },
});

export default PhotoField;
