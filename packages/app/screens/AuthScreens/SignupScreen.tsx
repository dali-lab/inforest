import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View, Image } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import useAppDispatch from "../../hooks/useAppDispatch";
import { AuthParams, signUp } from "../../redux/slices/userSlice";
import TextField from "../../components/fields/TextField";
import AppButton from "../../components/AppButton";
import { useNavigation } from "@react-navigation/native";
import { titled_logo } from "../../assets/images";
import { Text, TextVariants } from "../../components/Themed";
import LoadingOverlay from "../../components/LoadingOverlay";
import useAppSelector from "../../hooks/useAppSelector";
import { useIsConnected } from "react-native-offline";

const SignupScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const isConnected = useIsConnected();

  const { loading } = useAppSelector((state) => state.user);

  const [newUser, setNewUser] = useState<
    AuthParams & { confirmEmail?: string; confirmPassword?: string }
  >({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const updateState = (updatedFields: Partial<typeof newUser>) => {
    setNewUser({ ...newUser, ...updatedFields });
  };

  const handleSubmit = useCallback(async () => {
    try {
      if (!isConnected) {
        alert("You must be online to sign up!");
        return;
      }
      if (newUser.email != newUser.confirmEmail) {
        alert("Your emails do not match");
        throw new Error("Emails do not match");
      }
      if (newUser.password != newUser.confirmPassword) {
        alert("Your passwords do not match");
        throw new Error("Passwords do not match");
      }
      const { confirmEmail, confirmPassword, ...userData } = newUser;
      dispatch(signUp(userData)).then(() => {
        // @ts-ignore
        navigation.navigate("login", {});
      });
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [newUser, dispatch, navigation, isConnected]);

  return (
    <>
      <View
        style={{
          ...styles.container,
          paddingVertical: styles.container.paddingVertical - headerHeight,
        }}
      >
        <Image style={{ height: 185, width: 250 }} source={titled_logo}></Image>
        <Text variant={TextVariants.H1}>Sign up</Text>
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <TextField
              label="First Name"
              value={newUser.firstName}
              setValue={(newValue) => {
                updateState({ firstName: newValue });
              }}
              textType="SHORT_TEXT"
              noHint
              editing
              wrapperStyle={{ width: "49%", marginRight: "2%" }}
            />

            <TextField
              label="Last Name"
              value={newUser.lastName}
              setValue={(newValue) => {
                updateState({ lastName: newValue });
              }}
              textType="SHORT_TEXT"
              noHint
              editing
              wrapperStyle={{ width: "49%" }}
            />
          </View>

          <View style={styles.formRow}>
            <TextField
              label="Email"
              textType="SHORT_TEXT"
              value={newUser.email}
              wrapperStyle={{ width: "100%" }}
              setValue={(newValue) => {
                updateState({ email: newValue });
              }}
              noHint
              editing
            />
          </View>
          <View style={styles.formRow}>
            <TextField
              value={newUser.confirmEmail}
              setValue={(newValue) => {
                updateState({ confirmEmail: newValue });
              }}
              wrapperStyle={{ width: "100%" }}
              label="Confirm email"
              textType="SHORT_TEXT"
              noHint
              editing
            />
          </View>
          <View style={styles.formRow}>
            <TextField
              label="Password"
              textType="SHORT_TEXT"
              value={newUser.password}
              setValue={(newValue) => {
                updateState({ password: newValue });
              }}
              wrapperStyle={{ width: "100%" }}
              noHint
              editing
              secure
            />
          </View>
          <View style={styles.formRow}>
            <TextField
              value={newUser.confirmPassword}
              setValue={(newValue) => {
                updateState({ confirmPassword: newValue });
              }}
              label="Confirm password"
              textType="SHORT_TEXT"
              wrapperStyle={{ width: "100%" }}
              noHint
              editing
              secure
            />
          </View>
          <AppButton
            onPress={() => {
              handleSubmit();
            }}
            type="COLOR"
            style={[styles.navButton, { marginLeft: "auto", marginTop: 12 }]}
          >
            Next
          </AppButton>
        </View>
      </View>
      {loading && <LoadingOverlay>Signing Up...</LoadingOverlay>}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    paddingVertical: 128,
  },
  formContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 128,
    marginTop: 24,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    height: 72,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  navButton: {
    // width: 72,
    flexGrow: 0,
  },
  reviewScroll: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});

export default SignupScreen;
