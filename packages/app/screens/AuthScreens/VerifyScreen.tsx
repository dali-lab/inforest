import { MutableRefObject, useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, View, TextInput, Image } from "react-native";
import useAppDispatch from "../../hooks/useAppDispatch";
import { verify, resendCode, logout } from "../../redux/slices/userSlice";
import AppButton from "../../components/AppButton";
import { titled_logo } from "../../assets/images";
import { Text, TextVariants } from "../../components/Themed";
import Colors from "../../constants/Colors";
import useAppSelector from "../../hooks/useAppSelector";

const CODE_LENGTH = 6;

const VerifyScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  // const navigation = useNavigation();

  const { currentUser } = useAppSelector((state) => state.user);

  const email = currentUser?.email;

  const [code, setCode] = useState(" ".repeat(CODE_LENGTH));
  const updateCode = (index: number, value: string) => {
    setCode(
      code.substring(0, index) +
        value[0] +
        code.substring(index + 1, code.length)
    );
  };

  const refs = useRef<TextInput[]>([]);

  const switchInput = (index: number) => {
    if (index < 0) index = 0;
    if (index > CODE_LENGTH - 1) index = CODE_LENGTH - 1;

    // focus on the input text box with this index
    // refs.current[index].focus();
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
      // if (index < CODE_LENGTH - 1) switchInput(index + 1);
    }
  };

  const handleSubmit = useCallback(() => {
    try {
      // check code
      email && dispatch(verify({ code, email }));
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [dispatch, code, email]);

  const handleResend = useCallback(() => {
    try {
      email && dispatch(resendCode({ email }));
    } catch (err: any) {
      alert(err?.message || "An unknown error occured.");
    }
  }, [dispatch, email]);

  const inputs: React.ReactElement[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    inputs.push(
      <CharacterEntryBox
        index={i}
        value={code[i]}
        handleKey={handleKey}
        refs={refs}
        key={i}
      ></CharacterEntryBox>
    );
  }

  return (
    <View style={styles.container}>
      <Image style={{ height: 185, width: 250 }} source={titled_logo}></Image>
      <Text variant={TextVariants.H1}>Verify Email</Text>

      <View style={styles.formContainer}>
        <Text variant={TextVariants.Body}>
          When you signed up, your email was sent a verification code. Enter
          that code here, or request a new code if you did not receive it.
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginVertical: 24,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {inputs}
        </View>
        <View style={styles.formRow}>
          <AppButton
            type="RED"
            onPress={() => {
              dispatch(logout());
            }}
          >
            Logout
          </AppButton>
          <View style={{ flexDirection: "row" }}>
            <AppButton
              onPress={() => {
                handleResend();
              }}
              style={[styles.navButton]}
            >
              Request New Code?
            </AppButton>
            <AppButton
              onPress={() => {
                handleSubmit();
              }}
              style={[styles.navButton]}
              type="COLOR"
            >
              Submit
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
  refs: MutableRefObject<TextInput[]>;
}

const CharacterEntryBox: React.FC<CharacterEntryBoxProps> = ({
  index,
  value,
  handleKey,
  // refs,
}) => {
  return (
    <View
      style={{
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        marginBottom: 12,
        height: 100,
        width: 76,
        borderRadius: 16,
        backgroundColor: Colors.secondary.light,
      }}
    >
      <TextInput
        style={{ fontSize: 72, width: "100%", textAlign: "center" }}
        onKeyPress={(e) => {
          handleKey(index, e.nativeEvent.key);
        }}
        // ref={(el) => refs?.current?.[index] && (refs.current[index] = el)}
        value={value}
      ></TextInput>
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
    marginTop: 12,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  navButton: {
    marginLeft: 12,
    flexGrow: 0,
  },
  reviewScroll: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});

export default VerifyScreen;
