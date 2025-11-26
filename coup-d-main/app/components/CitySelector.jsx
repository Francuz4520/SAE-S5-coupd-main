import React from "react";
import {FlatList, View, Pressable, Text, StyleSheet} from "react-native";
export default function CitySelector({cities, setCity}) {
    console.log("CITIES RECUS =", cities);
    return(
        <View>
             {cities.map((item) => { 
                return( <Pressable style={({ pressed }) => [styles.city,pressed && styles.cityPressed]} 
                        key={item.id} onPress={() => setCity(item.libelle)}>
                             <Text >{item.libelle} {item.postcode} </Text> 
                        </Pressable>) })}
        </View>
    )
}
const styles = StyleSheet.create({
    city: {
        backgroundColor: "white",
        padding: 5,
        borderBottomWidth: 1,
        borderColor: "black",
    },
    
    cityPressed: {
        backgroundColor: "#DEDEDE"
    }
});