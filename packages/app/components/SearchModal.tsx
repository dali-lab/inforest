import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchModalProps {
  open: boolean;
  onExit: () => void;
  onSubmit: (searchValue: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = (props) => {
  const { open, onExit, onSubmit } = props;
  const [searchValue, setSearchValue] = useState<string>("");
  return (
    <Modal visible={open} transparent={true} animationType="fade">
      <Pressable style={styles.centeredView} onPress={onExit}>
        <View style={[styles.modal, styles.modalContainer]}>
          <TextInput
            value={searchValue}
            onChangeText={(text) => setSearchValue(text)}
            onSubmitEditing={() => {
              onSubmit(searchValue);
              setSearchValue("");
            }}
            placeholder="Search for a tree by tag #"
            returnKeyType="search"
            style={{ width: 256 }}
            autoFocus={true}
          ></TextInput>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    alignSelf: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SearchModal;
