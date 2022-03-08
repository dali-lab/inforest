import React, {useMemo, useEffect} from "react"
import { View, StyleSheet, Text, Circle } from "react-native"
import useAppDispatch from "../hooks/useAppDispatch"
import useAppSelector from "../hooks/useAppSelector"
import { RootState } from "../redux"
import { getManyTreeSpecies } from "../redux/slices/treeSpeciesSlice"
import { VisualizationConfigType } from "../types"

interface ColorKeyProps {
    config: VisualizationConfigType;
    speciesFrequencyMap: {[species:string]:number}
}

const NUM_KEY_ENTRIES = 5

const ColorKey: React.FC<ColorKeyProps> = ({config, speciesFrequencyMap})=>{
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getManyTreeSpecies({codes:Object.keys(speciesFrequencyMap)}))
    }, [speciesFrequencyMap]);
    const reduxState = useAppSelector((state: RootState) => state);
    const { all: allSpecies } = reduxState.treeSpecies;
    const frequencyMapEntries = useMemo(()=>Object.entries(speciesFrequencyMap).slice(0,NUM_KEY_ENTRIES),[speciesFrequencyMap, config])
    return (
    <View style={styles.keyContent}>
        <Text style = {styles.title}>Color Key</Text>
        <View style={styles.rowContainer}>
        {
            frequencyMapEntries.map(([speciesCode, frequency])=>
                <KeyRow color={config.speciesColorMap[speciesCode]} species={allSpecies[speciesCode].name}/>
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
        width: 128,
        backgroundColor:"rgba(255, 255, 255, 0.4)",
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
