import React from "react";
import {
  ListRenderItemInfo,
  Pressable,
  View,
  Image,
  StyleSheet,
} from "react-native";
import FieldController from "../FieldController";
import SelectField from "../SelectField";
import Colors from "../../../constants/Colors";
import { Text, TextVariants } from "../../Themed";
import { Ionicons } from "@expo/vector-icons";
import { TreePhoto } from "@ong-forestry/schema";

interface PhotoItemProps {
  item: ListRenderItemInfo<TreePhoto>;
  removePhoto: (url: string) => void;
  options: { label: string; value: string }[];
  setPurpose: (newValue: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  item: { item },
  removePhoto,
  options,
  setPurpose,
}) => {
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
          uri: item.fullUrl,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FieldController
          value={item.purposeName}
          onConfirm={(newValue) => {
            setPurpose(newValue);
          }}
          formComponent={
            <Text variant={TextVariants.Label} style={{ marginVertical: 4 }}>
              {item.purposeName || "Add Label +"}
            </Text>
          }
          modalComponent={
            <SelectField label="Photo Labels" pickerOptions={options} />
          }
        />
      </View>
      <Pressable
        onPress={() => {
          removePhoto(item.fullUrl);
        }}
        style={styles.photoRemove}
      >
        <Ionicons name="close-outline" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default PhotoItem;
