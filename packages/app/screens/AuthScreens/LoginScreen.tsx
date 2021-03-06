import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View, Image } from "react-native";
import { Text, TextVariants } from "../../components/Themed";
import TextField from "../../components/fields/TextField";
import AppButton from "../../components/AppButton";
import useAppDispatch from "../../hooks/useAppDispatch";
import { login } from "../../redux/slices/userSlice";
import { useNavigation } from "@react-navigation/native";
import { AuthStackParamList } from "../../Screens";
import { titled_logo } from "../../assets/images";
import DividerLine from "../../components/DividerLine";
import LoadingOverlay from "../../components/LoadingOverlay";
import useAppSelector from "../../hooks/useAppSelector";
import { useIsConnected } from "react-native-offline";

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AuthStackParamList>();
  const isConnected = useIsConnected();

  const { loading } = useAppSelector((state) => state.user);

  const [state, setState] = useState({ email: "", password: "" });
  const updateState = (updatedFields: Partial<typeof state>) => {
    setState({ ...state, ...updatedFields });
  };

  const handleSubmit = useCallback(async () => {
    try {
      if (!isConnected) alert("You must be online to login!");
      else await dispatch(login(state));
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [state, dispatch, isConnected]);

  return (
    <>
      <View style={styles.container}>
        <Image style={{ height: 185, width: 250 }} source={titled_logo}></Image>
        <Text variant={TextVariants.H1}>Sign in</Text>
        <View style={styles.formContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.formRow}>
              <TextField
                value={state?.email}
                setValue={(newValue) => {
                  updateState({ email: newValue });
                }}
                label="Email"
                textType="SHORT_TEXT"
                editing
                noHint
              />
            </View>
            <View style={styles.formRow}>
              <TextField
                value={state?.password}
                setValue={(newValue) => {
                  updateState({ password: newValue });
                }}
                label="Password"
                textType="SHORT_TEXT"
                secure
                editing
                noHint
              />
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <AppButton
                onPress={() => {
                  handleSubmit();
                }}
                style={[styles.navButton, { marginLeft: "auto" }]}
                type="COLOR"
              >
                Submit
              </AppButton>
            </View>
          </View>
          <View
            style={{
              width: "90%",
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 32,
              justifyContent: "center",
            }}
          >
            <DividerLine width="33%" />
            <Text
              variant={TextVariants.H3}
              style={{ width: "33%", textAlign: "center" }}
            >
              or
            </Text>
            <DividerLine width="33%" />
          </View>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <AppButton
              onPress={() => {
                //@ts-ignore
                navigation.navigate("signup", {});
              }}
              style={[styles.navButton, { marginHorizontal: "auto" }]}
            >
              Create account
            </AppButton>
          </View>
        </View>
      </View>
      {loading && <LoadingOverlay>Logging in...</LoadingOverlay>}
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
  innerContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 12,
  },
  formRow: {
    flexDirection: "column",
    marginBottom: 24,
    height: 80,
  },
  dividerLine: {},
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

export default LoginScreen;
