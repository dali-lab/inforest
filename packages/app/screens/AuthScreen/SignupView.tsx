import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View, Image } from "react-native";
import useAppDispatch from "../../hooks/useAppDispatch";
import { signUp } from "../../redux/slices/userSlice";
import FieldController from "../../components/fields/FieldController";
import TextField from "../../components/fields/TextField";
import AppButton from "../../components/AppButton";
import { useNavigation } from "@react-navigation/native";
import { titled_logo } from "../../assets/images";
import { Text, TextVariants } from "../../components/Themed";

interface SignupViewProps {}

const SignupView: React.FC<SignupViewProps> = (props) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [state, setState] = useState({
    name: "Julian George",
    email: "juliancgeorge@gmail.com",
    confirmEmail: "juliancgeorge@gmail.com",
    password: "Fudgemuffin11!",
    confirmPassword: "Fudgemuffin11!",
  });

  const updateState = (updatedFields: Partial<typeof state>) => {
    setState({ ...state, ...updatedFields });
  };

  const handleSubmit = useCallback(() => {
    try {
      if (state.email != state.confirmEmail)
        throw new Error("Emails do not match");
      if (state.password != state.confirmPassword)
        throw new Error("Passwords do not match");

      dispatch(signUp(state));
      //@ts-ignore
      navigation.navigate("verify", {});
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [state, dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Image style={{ height: 185, width: 250 }} source={titled_logo}></Image>
      <Text variant={TextVariants.H1}>Sign up</Text>
      <View style={styles.formContainer}>
        <View style={styles.formRow}>
          <TextField
            label="Full Name"
            value={state.name}
            setValue={(newValue) => {
              updateState({ name: newValue });
            }}
            textType="SHORT_TEXT"
            noHint
            editing
          />
        </View>

        <View style={styles.formRow}>
          <TextField
            label="Email"
            textType="SHORT_TEXT"
            value={state.email}
            setValue={(newValue) => {
              updateState({ email: newValue });
            }}
            noHint
            editing
          />
        </View>
        <View style={styles.formRow}>
          <TextField
            value={state.confirmEmail}
            setValue={(newValue) => {
              updateState({ confirmEmail: newValue });
            }}
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
            value={state.password}
            setValue={(newValue) => {
              updateState({ password: newValue });
            }}
            noHint
            editing
            secure
          />
        </View>
        <View style={styles.formRow}>
          <TextField
            value={state.confirmPassword}
            setValue={(newValue) => {
              updateState({ confirmPassword: newValue });
            }}
            label="Confirm password"
            textType="SHORT_TEXT"
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

export default SignupView;
