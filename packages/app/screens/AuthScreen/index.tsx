import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import SignupView from "./SignupView";
import LoginView from "./LoginView";
import VerifyView from "./VerifyView";

export enum AuthSteps {
  Signup = "SIGNUP",
  Login = "LOGIN",
  Verify = "VERIFY",
}

export default function AuthScreen() {
  const [step, setStep] = useState<AuthSteps>(AuthSteps.Login);

  return (
    <View style={styles.container}>
      {step == AuthSteps.Signup && <SignupView setStep={setStep} />}
      {step == AuthSteps.Login && <LoginView setStep={setStep} />}
      {step == AuthSteps.Verify && <VerifyView setStep={setStep} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
