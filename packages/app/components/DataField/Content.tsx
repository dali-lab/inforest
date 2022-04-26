import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Image,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Inset, Queue } from "react-native-spacing-system";
import {
  launchImageLibraryAsync,
  ImagePickerOptions,
  ImageInfo,
} from "expo-image-picker";
import Colors from "../../constants/Colors";
import { Text, TextVariants } from "../Themed";
import { DataFieldProps } from "./index";

type ContentProps = DataFieldProps & { editing: boolean };
const Content: React.FC<ContentProps> = ({
  type,
  label,
  value,
  placeholder,
  editable = true,
  onUpdate,
  editing,
  suffix,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const textInputNull = useMemo(() => textInputRef == null, [textInputRef]);
  useEffect(() => {
    textInputRef.current?.focus();
  }, [textInputNull]);

  let keyboardType: KeyboardTypeOptions = "default";
  switch (type) {
    case "INTEGER":
      keyboardType = "number-pad";
      break;
    case "DECIMAL":
      keyboardType = "decimal-pad";
      break;
  }

  const onSubmitEditing = useCallback(
    (value: string) => {
      if (onUpdate) {
        switch (type) {
          //TODO: build
          case "SELECT":
          case "SHORT_TEXT":
          case "LONG_TEXT":
            onUpdate(value);
            break;
          case "INTEGER": {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
              onUpdate(parsed);
            }
            break;
          }
          case "DECIMAL": {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
              onUpdate(parsed);
            }
            break;
          }
        }
      }
    },
    [type, onUpdate]
  );

  return (
    <>
      <View style={styles.header}>
        <Text variant={TextVariants.Label}>{label}</Text>
        <Queue size={6}></Queue>
        <Ionicons
          name="ios-information-circle-outline"
          size={16}
          color={Colors.neutral[7]}
        ></Ionicons>
      </View>
      <Inset vertical={4} horizontal={8}>
        {type !== "PHOTOS" ? (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {editing ? (
              <TextInput
                ref={textInputRef}
                style={{
                  fontFamily: "Open Sans Regular",
                  height: type === "LONG_TEXT" ? 128 : undefined,
                }}
                focusable={true}
                keyboardType={keyboardType}
                onSubmitEditing={(e) => {
                  onSubmitEditing(e.nativeEvent.text);
                }}
                multiline={type === "LONG_TEXT"}
                returnKeyType="done"
              >
                {value}
              </TextInput>
            ) : (
              <Text
                variant={TextVariants.Body}
                color={editable ? undefined : Colors.neutral[4]}
                style={{ height: type === "LONG_TEXT" ? 128 : undefined }}
              >
                {value ?? placeholder}
              </Text>
            )}
            {suffix && <Text style={{ textAlign: "right" }}>{suffix}</Text>}
          </View>
        ) : (
          <View>
            <PhotoInput onUpdate={onUpdate as any} />
          </View>
        )}
      </Inset>
    </>
  );
};

const imageLibraryOptions: ImagePickerOptions = {
  base64: true,
};

interface PhotoInputProps {
  onUpdate: (newValue: any[]) => void;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ onUpdate }) => {
  const [photos, setPhotos] = useState<ImageInfo[]>([]);
  const addPhoto = useCallback(async () => {
    const photo = await launchImageLibraryAsync(imageLibraryOptions);
    if (!photo.cancelled) setPhotos((prev) => [...prev, photo]);
  }, [setPhotos]);
  useEffect(() => {
    onUpdate(photos);
  }, [photos]);
  const renderItem = (item: ListRenderItemInfo<ImageInfo>) => (
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
        <Text>Label</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.photoInputWrapper}>
      <View style={styles.photoUploadContainer}>
        <Pressable style={styles.photoInput} onPress={addPhoto}>
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
          renderItem={renderItem}
          horizontal={true}
          keyExtractor={(_item, i) => i.toString()}
          style={{ paddingVertical: 12 }}
        ></FlatList>
      </View>
      {/* <Text variant={TextVariants.Label}>{title}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  photoInputWrapper: {
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
  photoInput: {
    width: 120,
    height: 120,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#1F3527",
    borderWidth: 2,
    padding: 16,
  },
});

export default Content;
