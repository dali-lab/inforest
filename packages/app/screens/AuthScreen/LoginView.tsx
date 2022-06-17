import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Text } from "../../components/Themed";
import FieldController from "../../components/fields/FieldController";
import TextField from "../../components/fields/TextField";
import AppButton from "../../components/AppButton";
import useAppDispatch from "../../hooks/useAppDispatch";
import { AuthSteps } from ".";
import { login, setCredentials } from "../../redux/slices/userSlice";
import { Line } from "react-native-svg";

interface LoginViewProps {
  setStep: (mode: AuthSteps) => void;
}

const LoginView: React.FC<LoginViewProps> = (props) => {
  const dispatch = useAppDispatch();
  const setStep = props.setStep;

  const [state, setState] = useState({ email: "", password: "" });
  const updateState = (updatedFields: Partial<typeof state>) => {
    setState({ ...state, ...updatedFields });
  };

  const handleSubmit = useCallback(async () => {
    try {
      // check username and password
      const response = await dispatch(login(state));
      // if correct but not verified
      if (!response.verified) {
        // save user data to the store
        dispatch(setCredentials({ user: response.user }));

        // move to verify
        setStep(AuthSteps.Verify);
      }
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [state, dispatch, setStep]);

  return (
    <View style={styles.container}>
      <Text>Sign in</Text>
      <View style={styles.formContainer}>
        <View style={styles.formRow}>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            <FieldController
              value={state.email}
              onConfirm={(newValue) => {
                updateState({ email: newValue });
              }}
              formComponent={<TextField label="Email" textType="SHORT_TEXT" />}
            />
          </View>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            <FieldController
              value={state.password}
              onConfirm={(newValue) => {
                updateState({ password: newValue });
              }}
              formComponent={
                <TextField
                  secure={true}
                  label="Password"
                  textType="SHORT_TEXT"
                />
              }
            />
          </View>
          <AppButton
            onPress={() => {
              handleSubmit();
            }}
            style={[styles.navButton, { marginRight: "auto" }]}
          >
            Submit
          </AppButton>
        </View>
        <Line></Line> or <Line></Line>
        <View>
          <AppButton
            onPress={() => {
              setStep(AuthSteps.Signup);
            }}
            style={[styles.navButton, { marginRight: "auto" }]}
          >
            Create account
          </AppButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  formContainer: {
    flexDirection: "column",
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

export default LoginView;
