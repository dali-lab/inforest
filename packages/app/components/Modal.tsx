import React from "react"
import { View, Text, StyleSheet } from "react-native"
interface ModalProps {
    children?: React.ReactNode,
    title: string
}
const Modal: React.FC<ModalProps> = ({children, title})=>{
    return (
    <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <View>
        {children}
        </View>
    </View>)
}

const styles = StyleSheet.create({
    modal:{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
        width: 256,
        zIndex: 3,
        top: 16,
        paddingVertical: 12,
        paddingHorizontal:16
    },
    title:{
        fontSize:16,
        textAlign:"center",
        fontWeight:"bold"
    }
})

export default Modal