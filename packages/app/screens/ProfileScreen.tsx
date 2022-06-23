import { FC } from "react";
import { View, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import { Text, TextVariants } from "../components/Themed";
import useAppDispatch from "../hooks/useAppDispatch";
import { logout } from "../redux/slices/userSlice";

const ProfileScreen: FC = () => {
  const dispatch = useAppDispatch();
  return (
    <View style={styles.container}>
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
