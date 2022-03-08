import React, {useMemo, useEffect} from "react"
import { View, StyleSheet, Text } from "react-native"
import { VisualizationConfigType } from "../constants"
import useAppDispatch from "../hooks/useAppDispatch"
import useAppSelector from "../hooks/useAppSelector"
import { RootState } from "../redux"
import { getTreeSpecies } from "../redux/slices/treeSpeciesSlice"


interface ColorKeyProps {
    config: VisualizationConfigType;
    speciesFrequencyMap: {[species:string]:number}
}

const NUM_KEY_ENTRIES = 8

const ColorKey: React.FC<ColorKeyProps> = ({config, speciesFrequencyMap})=>{
    const dispatch = useAppDispatch();
    const reduxState = useAppSelector((state: RootState) => state);
    useEffect(()=>{
        // this isn't optimal, let's discuss a better way to fetch tree species without looping thru stuff so much and making so many requests
        for (const code of Object.keys(speciesFrequencyMap)) {
            if (!(code in Object.keys(allSpecies))) dispatch(getTreeSpecies({code:code}))
        }
    },[speciesFrequencyMap])
    const { all: allSpecies } = reduxState.treeSpecies;
    const frequencyMapEntries = useMemo(()=>Object.entries(speciesFrequencyMap).slice(0,NUM_KEY_ENTRIES),[speciesFrequencyMap, config])
    return (
    <View style={styles.keyContent}>
        <Text style = {styles.title}>Color Key</Text>
        <View style={styles.rowContainer}>
        {
            frequencyMapEntries.map(([speciesCode, frequency])=>
                <KeyRow key = {speciesCode} color={config.speciesColorMap[speciesCode]} species={allSpecies?.[speciesCode]?.commonName}/>
        )
        }
        </View>
    </View>)
}

interface KeyRowProps {
    color: string,
    species:string,
}

const KeyRow: React.FC<KeyRowProps> = ({color,species})=>{
return (
<View style={styles.keyRow}>
    <View style={[styles.circle,{backgroundColor:color}]}/>
    <Text>{species}</Text>
</View>)
}

const styles = StyleSheet.create({
    keyContent:{
        width: 160,
        backgroundColor:"rgba(255, 255, 255, 0.5)",
        borderRadius: 8,
        paddingVertical:6,
        paddingHorizontal:8
    },
    title:{
        fontSize:12,
        textAlign:"center",
        fontWeight:"bold"
    },
    rowContainer:{
        display:"flex"
    },
    keyRow:{
        display:"flex",
        flexDirection:"row",
        paddingVertical: 4,
        alignItems:"center"
    },
    circle:{
        width:12,
        height:12,
        borderRadius:6,
        marginHorizontal:4
    }
})

export default ColorKey
