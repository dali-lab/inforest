import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { AuthSteps } from ".";
import useAppDispatch from "../../hooks/useAppDispatch";
import { signUp } from "../../redux/slices/userSlice";
import FieldController from "../../components/fields/FieldController";
import TextField from "../../components/fields/TextField";
import AppButton from "../../components/AppButton";

interface SignupViewProps {
  setStep: (mode: AuthSteps) => void;
}

const SignupView: React.FC<SignupViewProps> = (props) => {
  const dispatch = useAppDispatch();
  const setStep = props.setStep;

  const [state, setState] = useState({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
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
      setStep(AuthSteps.Verify);
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [state, dispatch, setStep]);

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.formRow}>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            <FieldController
              value={state.name}
              onConfirm={(newValue) => {
                updateState({ name: newValue });
              }}
              formComponent={<TextField label="Name" textType="SHORT_TEXT" />}
            />
          </View>
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
              value={state.confirmEmail}
              onConfirm={(newValue) => {
                updateState({ confirmEmail: newValue });
              }}
              formComponent={
                <TextField label="Confirm email" textType="SHORT_TEXT" />
              }
            />
          </View>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            <FieldController
              value={state.password}
              onConfirm={(newValue) => {
                updateState({ password: newValue });
              }}
              formComponent={
                <TextField label="Password" textType="SHORT_TEXT" />
              }
            />
          </View>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            <FieldController
              value={state.confirmPassword}
              onConfirm={(newValue) => {
                updateState({ confirmPassword: newValue });
              }}
              formComponent={
                <TextField label="Confirm password" textType="SHORT_TEXT" />
              }
            />
          </View>
          <AppButton
            onPress={() => {
              handleSubmit();
            }}
            style={[styles.navButton, { marginRight: "auto" }]}
          >
            Next
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

export default SignupView;
