import React, { useCallback } from 'react'
import Modal from './Modal'
import {StyleSheet, Switch, View, Text } from "react-native"

interface VisualizationModalProps {
    config: any;
    setConfig: (config:any)=>void
}

const VisualizationModal: React.FC<VisualizationModalProps> = ({config, setConfig})=>{
    const toggleColorBySpecies = useCallback(()=>{
        setConfig((prev:any)=>({...prev, colorBySpecies: !prev.colorBySpecies}))
    },[setConfig])
    return (<Modal title="Visualization Settings">
        <View style = {styles.modalContent}>
            <View style={styles.toggleRow}>
                <Text>Color By Species</Text> 
                <Switch value={config.colorBySpecies} onValueChange={toggleColorBySpecies}/> 
            </View>
        </View>
    </Modal>)
}

const styles = StyleSheet.create({
    modalContent: {
        height:250
    },
    toggleRow: {
        marginVertical:12,
        fontSize:16,
        alignItems:"center",
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-between"
    }
})

export default VisualizationModal