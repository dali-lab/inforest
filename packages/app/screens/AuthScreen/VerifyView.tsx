import { LegacyRef, useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, View, TextInput } from "react-native";
import { AuthSteps } from ".";
import useAppDispatch from "../../hooks/useAppDispatch";
import { verify, resendCode } from "../../redux/slices/userSlice";
import AppButton from "../../components/AppButton";
import { useStore } from "react-redux";

const CODE_LENGTH = 6;

interface VerifyViewProps {
  setStep: (mode: AuthSteps) => void;
}

const VerifyView: React.FC<VerifyViewProps> = (props) => {
  const dispatch = useAppDispatch();
  const setStep = props.setStep;

  const store = useStore();
  const email = store.getState().user.email;

  const [code, setCode] = useState(" ".repeat(CODE_LENGTH));
  const updateCode = (index: number, value: string) => {
    setCode(
      code.substring(0, index) +
        value[0] +
        code.substring(index + 1, code.length)
    );
  };

  const refs = useRef([]);

  const switchInput = (index: number) => {
    if (index < 0) index = 0;
    if (index > CODE_LENGTH - 1) index = CODE_LENGTH - 1;

    // focus on the input text box with this index
    refs.current[index].focus();
  };

  const handleKey = (index: number, key: string) => {
    if (key == "Backspace") {
      // remove the char at this index from state
      updateCode(index, " ");

      // switch to previous text input (if exists)
      if (index > 0) switchInput(index - 1);
    } else if (key.length == 1) {
      // if not some other special key

      // add this character to state
      updateCode(index, key);

      // switch to next text input (if exists)
      if (index < CODE_LENGTH - 1) switchInput(index + 1);
    }
  };

  const handleSubmit = useCallback(() => {
    try {
      // check code
      dispatch(verify({ code, email }));
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [dispatch, code, email]);

  const handleBack = () => {
    try {
      // move to login
      setStep(AuthSteps.Login);
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  };

  const handleResend = () => {
    try {
      dispatch(resendCode({ email }));
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  };

  const inputs: React.ReactElement[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    inputs.push(
      <CharacterEntryBox
        index={i}
        value={code[i]}
        handleKey={handleKey}
        refs={refs}
      ></CharacterEntryBox>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.formRow}>
          <View style={{ flexDirection: "column", marginBottom: 24 }}>
            {...inputs}
          </View>
          <View>
            <AppButton
              onPress={() => {
                handleBack();
              }}
              style={[styles.navButton, { marginRight: "auto" }]}
            >
              Back
            </AppButton>
          </View>
          <View>
            <AppButton
              onPress={() => {
                handleSubmit();
              }}
              style={[styles.navButton, { marginRight: "auto" }]}
            >
              Submit
            </AppButton>
          </View>
          <View>
            <AppButton
              onPress={() => {
                handleResend();
              }}
              style={[styles.navButton, { marginRight: "auto" }]}
            >
              Request New Code?
            </AppButton>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CharacterEntryBoxProps {
  index: number;
  value: string;
  handleKey: (index: number, key: string) => void;
  refs: React.MutableRefObject<LegacyRef<TextInput>[]>;
}

const CharacterEntryBox: React.FC<CharacterEntryBoxProps> = ({
  index,
  value,
  handleKey,
  refs,
}) => {
  return (
    <View style={{ flexDirection: "column", marginBottom: 24 }}>
      <TextInput
        onKeyPress={(e) => {
          handleKey(index, e.nativeEvent.key);
        }}
        ref={refs.current[index]}
      >
        {value}
      </TextInput>
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

export default VerifyView;
