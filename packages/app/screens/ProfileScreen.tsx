import { FC } from "react";
import { View, StyleSheet } from "react-native";
import AppButton from "../components/AppButton";
import useAppDispatch from "../hooks/useAppDispatch";
import { logout } from "../redux/slices/userSlice";

const ProfileScreen: FC = () => {
  const dispatch = useAppDispatch();
  return (
    <View style={styles.container}>
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
    alignItems: "center",
  },
});

export default ProfileScreen;
