import {View, Image, StyleSheet, Text, Button, TextInput, Pressable} from "react-native"
import { Checkbox } from 'expo-checkbox';
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegistrationDetailsScreen({navigation}){
    return(
        <View style={styles.container}>
           <View> 
            <Text style={styles.title}>Informations du compte</Text>
            <Text>Nom<Text style={styles.mandatoryField}>*</Text></Text>
            <TextInput style={styles.input}/>
            <Text>Prénom<Text style={styles.mandatoryField}>*</Text></Text>
            <TextInput style={styles.input}/>
            <Text>Nom d'utilisateur<Text style={styles.mandatoryField}>*</Text></Text>
            <TextInput style={styles.input}/>
            <Text>Date de naissance<Text style={styles.mandatoryField}>*</Text></Text>
            
            <Text>Ville<Text style={styles.mandatoryField}>*</Text></Text>
            <TextInput style={styles.input}/>
            <Text>Numéro de téléphone</Text>
            <TextInput style={styles.input}/>
            <View style={styles.blocCGU}>
                <Checkbox style={styles.checkBox}></Checkbox>
                <Text>J'accepte les </Text>
                <Pressable  >
                    <Text style={styles.linkCGU}>conditions générales d'utilisation</Text>
                </Pressable>
            </View>
            
            <Text style={styles.mandatoryFieldText}><Text style={styles.mandatoryField}>*</Text> Champs obligatoires</Text>
            <Pressable style={styles.btnRegistration} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.btnRegistrationText}>S'inscrire</Text>
            </Pressable>
            </View>
        </View>
        
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 40
    },
    logo:{
        alignSelf: "center",
        height: 175,
        width: 120
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "white",
        marginBottom: 10
    },
    link:{
        textDecorationLine: "underline",
        marginBottom: 10,
        color: "#525252"
    },
    btnRegistration:{
        backgroundColor: "#29AAAB",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        marginBottom: 35
    },
    btnRegistrationText:{
        color: "white",
        fontSize: 18
    },
    checkBox:{
        marginRight: 10
    },
    blocCGU: {
        flexDirection: "row",
    },
    linkCGU:{
        color: "#00BFFF",
        textDecorationLine: "underline",
        alignSelf: "center",
        marginBottom: 10
    },
    mandatoryFieldText: {
        alignSelf: "center",
        marginBottom: 10
    },
    mandatoryField: {
        color: "#ED0000"
    }
});