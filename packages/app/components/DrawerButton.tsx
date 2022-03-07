import React from "react";
import { GestureResponderEvent, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface DrawerButtonProps {
    children: React.ReactNode;
    onPress: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>
}


const DrawerButton: React.FC<DrawerButtonProps> = ({
    children,
    onPress,
    style
}) => {
    return <Pressable style={[style, styles.button]} onPress={onPress}><Text style={styles.text}>{children}</Text></Pressable>
}


const styles = StyleSheet.create({
    button: {
    backgroundColor:"#FFFFFF",
    borderRadius: 11,
    height: 48,
    alignItems:"center",
    justifyContent: "center",
    paddingVertical:12,
    paddingHorizontal: 16
},
text: {
    fontWeight:"bold"
}
})

export default DrawerButton