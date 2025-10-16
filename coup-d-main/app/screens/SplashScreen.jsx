import { useEffect } from "react";
import { Text, View, StyleSheet, Image } from "react-native";

export default function SplashScreen({navigation}){
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Home')
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
