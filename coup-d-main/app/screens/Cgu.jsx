import {View, Text, StyleSheet, Pressable} from "react-native"
export default function CguScreen({navigation}){
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Conditions générales d'utilisation</Text>
            </View>
            <Text style={styles.text}>Conditions générales d'utilisation</Text>
            <Pressable style={styles.btnAccept} onPress={() =>  navigation.navigate("Registration")}>
                <Text style={styles.btnAcceptText}>Retour à la page d'inscription</Text>
            </Pressable>
        </View>
    )
}
const PRIMARY = "#29AAAB";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: PRIMARY,
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },
    text: {
        margin: 10,
    },
    btnAccept: {
        backgroundColor: PRIMARY,
        padding: 5,
        margin: 10,
        borderRadius: 15
    },
    btnAcceptText: {
        color: "white",
        alignSelf: "center"
    }
})