import { useEffect } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({navigation}){
    useEffect(() => {
        setTimeout(async () => {
            const user = await AsyncStorage.getItem("user");
            if(user){
                console.log("Connection automatique de", JSON.parse(user).email);
                navigation.navigate('Home');
            } else {
                navigation.navigate('Connection');
            }
        }, 3000);
    }, []);
    return(
        <View style={styles.container}>
            <Image source={require('../../assets/images/logo_coup-dmain.png')} alt='logo' />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
