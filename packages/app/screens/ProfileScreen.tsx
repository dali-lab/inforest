import { FC } from "react";
import { View, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import { Text, TextVariants } from "../components/Themed";
import useAppDispatch from "../hooks/useAppDispatch";
import { logout } from "../redux/slices/userSlice";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigation();

  return (
    <View style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          borderRadius: 16,
          width: 64,
          height: 64,
          overflow: "hidden",
        }}
      >
        <Ionicons
          name="ios-arrow-back"
          size={32}
          onPress={() => {
            navigate.goBack();
          }}
        />
      </View>
      <Text variant={TextVariants.H2} style={{ marginBottom: 16 }}>
        Your Profile
      </Text>
      <AppButton
        onPress={() => {
          dispatch(logout());
        }}
        type="RED"
      >
        Log Out
      </AppButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 128,
    paddingHorizontal: 256,
    height: "100%",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
