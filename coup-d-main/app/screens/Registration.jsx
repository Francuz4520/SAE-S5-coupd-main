import {View, Image, StyleSheet, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView, Platform} from "react-native"
import { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential} from "firebase/auth";
import { Checkbox } from 'expo-checkbox';
import { doc, setDoc, getFirestore, loadBundle } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import DateTimePicker from "@react-native-community/datetimepicker";
import triggerAutoComplete, {cityExists, normalizeCityName} from '../utils/handleCities';
import {useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import CitySelector from "../components/CitySelector"
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from "../config/firebase";
import * as AuthSession from "expo-auth-session";



export default function RegistrationScreen({route, navigation}){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lastname, setLastname] = useState("");
    const [firstname, setFirstname] = useState("");
    const [username, setUsername] = useState("");
    const [show, setShow] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [dateText, setDateText] = useState("");
    const [city, setCity] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errors, setErrors] = useState({});
    const [cities, setCities] = useState([]);
    const [cgu, setCgu] = useState(false);
    const [stayConnected, setStayConnected] = useState(false);


    const onChangeDate = (event, selectedDate) => {
        setShow(false);

        if (selectedDate) {
            setDateText(selectedDate.toLocaleDateString())
            setDateOfBirth(selectedDate);
        }
    };

    function createDateWithText(text){
        const parts = text.split("/");
        if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
            if (day && month && year) {
                const newDate = new Date(year, month - 1, day);
                if (!isNaN(newDate)) {
                    setDateOfBirth(newDate);
                    return;
                }
            }
        }
        setDateOfBirth(null);
    }
    const firebaseErrors ={
        "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
        "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
        "auth/missing-password": "Veuillez saisir un mot de passe.",
        "auth/password-does-not-meet-requirements": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un caractère spécial et un chiffre.",
    }

    async function handleSignup() {
        const auth = getAuth();
        const validationErrors = checkInputs()
        if(Object.keys(validationErrors).length > 0){
            setErrors(validationErrors)
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            registerInformations(user.uid);

            console.log("Utilisateur créé", user.email);
            if(stayConnected) AsyncStorage.setItem("user", JSON.stringify(user));
            navigation.navigate("Home");

        } catch (error) {
            let errors = {};
            const errorCode = error.code;
            console.log(errorCode)
            if (errorCode?.includes("email")) errors.email = firebaseErrors[errorCode];
            if (errorCode?.includes("password")) errors.password = firebaseErrors[errorCode];

            setErrors(errors);
        }
    }

    function checkInputs(){
        console.log(username)
        let validationErrors = {};

        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\-]+$/;
        const phoneNumberRegex = /^0[1-9]\d{8}$/;
        
        if(firstname === ""){
            validationErrors.firstname = "Le prénom doit être renseigné.";
        }
        else if (!nameRegex.test(firstname)) {
            validationErrors.firstname = "Le prénom ne doit contenir que des lettres.";
        }
        if(lastname === ""){
            validationErrors.lastname = "Le nom doit être renseigné.";
        }
        else if (!nameRegex.test(lastname)) {
            validationErrors.lastname = "Le nom ne doit contenir que des lettres.";
        }
        if(username === ""){
            validationErrors.username = "Le nom d'utilisateur doit être renseigné."
        }
        if(dateOfBirth === null || dateOfBirth > new Date()){
            validationErrors.dateOfBirth = "La date de naissance n'est pas valide."
        }
        if(city === ""){
            validationErrors.city = "La ville doit être renseignée."
        }
        else if(!cityExists(city)){
            validationErrors.city = "La ville n'est pas valide."
        }
        if(phoneNumber !== "" && !phoneNumberRegex.test(phoneNumber)){
            validationErrors.phoneNumber = "Le numéro de téléphone n'est pas valide."
        }
        if(cgu === false) {
            validationErrors.cgu = "Veuillez lire et accepter les conditions générales d'utilisation."
        }
        return validationErrors;
    }   

    async function registerInformations(id) {
        const firebaseConfig = {
            apiKey: "AIzaSyCiMQX0w9x738U1bTYi75EaxncHe0BU_IY",
            authDomain: "saecoupdmain.firebaseapp.com",
            projectId: "saecoupdmain",
            storageBucket: "saecoupdmain.firebasestorage.app",
            messagingSenderId: "51236011687",
            appId: "1:51236011687:web:355ca4439aaf49f430a582"
        };
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const cityNormalized = normalizeCityName(city)
        const fields = {firstname, lastname, username, dateOfBirth, cityNormalized}
        if(phoneNumber !== "") fields.phoneNumber = phoneNumber;
                    
        await setDoc(doc(db, "users", id), 
            fields
        );
    }

    
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "51236011687-k2o40fmkcrre60uurfh57qq726rgrksc.apps.googleusercontent.com",
        iosClientId: "51236011687-k2o40fmkcrre60uurfh57qq726rgrksc.apps.googleusercontent.com",
        webClientId: "51236011687-k2o40fmkcrre60uurfh57qq726rgrksc.apps.googleusercontent.com",
    });

    useEffect(() => {
        
        console.log("Réponse Google :", response);
        if (response?.type === "success") {
        const { id_token } = response.params;

        // Convertir le token Google en utilisateur Firebase
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
        .then((userCredential) => {
            console.log("Connecté à Firebase :", userCredential.user);
        })
        .catch((error) => {
            console.error("Erreur Firebase :", error);
        });

        }
    }, [response]);
   
    return(
       <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
            style={{ flex: 1}}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                paddingBottom: 20,   // PAS plus
                paddingTop: 0,       // pas d’offset inutile
                }}
                keyboardShouldPersistTaps="always"
            >
                <Image style={styles.logo}source={require("../../assets/images/logo_coup-dmain.png")} />
                <Text style={styles.title}>Créer un compte</Text>
                <Pressable style={styles.btnGoogle} onPress={() => promptAsync()} disabled={!request}>
                    <Image style={styles.logoGoogle}source={require("../../assets/images/logo_google.png")}></Image>
                    <Text>Continuer avec Google</Text>
                </Pressable>
                <View style={styles.orSeparation}>
                    <View style={styles.line}></View>
                    <View><Text style={{marginHorizontal: 10}}>OU</Text></View>
                    <View style={styles.line}></View>
                </View>
                <Text>Email<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" inputMode="email"/>
                {errors.email && <Text style={styles.textError}>{errors.email}</Text>}
                <Text>Mot de passe<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry/>
                {errors.password && <Text style={styles.textError}>{errors.password}</Text>}
                
                <Text>Nom<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={lastname} onChangeText={setLastname}/>
                {errors.lastname && <Text style={styles.textError}>{errors.lastname}</Text>}
                <Text>Prénom<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={firstname} onChangeText={setFirstname}/>
                {errors.firstname && <Text style={styles.textError}>{errors.firstname}</Text>}
                <Text>Nom d'utilisateur<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none"/>
                {errors.username && <Text style={styles.textError}>{errors.username}</Text>}
                <Text>Date de naissance<Text style={styles.mandatoryField}>*</Text></Text>
                <View>
                    <TextInput style={styles.input} value={dateText} onChangeText={ (text) => {
                        setDateText(text);
                        createDateWithText(text);
                    }}/>
                    <Pressable style={styles.iconContainer}onPress={() => setShow(true)}>
                        <Image style={styles.icon} source={require("../../assets/icons/calendar.png")}></Image>
                    </Pressable>
                </View>
                
                {show && (
                <DateTimePicker
                    value={dateOfBirth ?? new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />)}
                
                {errors.dateOfBirth && <Text style={styles.textError}>{errors.dateOfBirth}</Text>}
                <Text>Ville<Text style={styles.mandatoryField}>*</Text></Text>
                <TextInput style={styles.input} value={city} onChangeText={(text) => {
                    setCity(text);
                    setCities(triggerAutoComplete(text));
                }}/>
                <CitySelector cities={cities} setCity={setCity} setCities={setCities}></CitySelector>
                
                
                
                
                {errors.city && <Text style={styles.textError}>{errors.city}</Text>}
                <Text>Numéro de téléphone</Text>
                <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} inputMode="tel"/>
                {errors.phoneNumber && <Text style={styles.textError}>{errors.phoneNumber}</Text>}
                <View style={styles.blocCGU}>
                    <Checkbox style={styles.checkBox} value={cgu} onValueChange={setCgu}></Checkbox>
                    <View style={styles.textCgu}>
                        <Text >J'ai lu et j'accepte les </Text>
                    <Pressable onPress={() => navigation.navigate("Cgu")}>
                        <Text style={styles.linkCGU}>conditions générales d'utilisation</Text>
                    </Pressable>
                    </View>
                </View>
                {errors.cgu && <Text style={styles.textError}>{errors.cgu}</Text>}
                
                <Text style={styles.mandatoryFieldText}><Text style={styles.mandatoryField}>*</Text> Champs obligatoires</Text>
                
                <View style={styles.blocConnected}>
                    <Checkbox style={styles.checkBox} value={stayConnected} onValueChange={setStayConnected}></Checkbox>
                    <Text>Rester connecté</Text>
                </View>
                <Pressable style={styles.btnConnection} onPress={handleSignup}>
                    <Text style={styles.btnConnectionText}>S'inscrire</Text>
                </Pressable>
                <Text style={styles.noAccountText}>Vous possédez déjà un compte ?</Text>
                <Pressable onPress={() => navigation.navigate("Connection")}>
                    <Text style={styles.linkCreateAccount}>Se connecter</Text>
                </Pressable>
                </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    btnGoogle: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        borderWidth: 1,
        padding: 7,
        marginBottom: 20
    },

    logoGoogle: {
        width: 30,
        height: 30,
        marginRight: 40
    },
    orSeparation:{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },
    line:{
        flex: 1,
        height:1,
        backgroundColor: "black"
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
    btnConnection:{
        backgroundColor: "#29AAAB",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        marginBottom: 35
    },
    btnConnectionText:{
        color: "white",
        fontSize: 18
    },
    noAccountText: {
        alignSelf: "center",
        marginBottom: 7
    },
    linkCreateAccount:{
        color: "#00BFFF",
        textDecorationLine: "underline",
        alignSelf: "center"
    },
    textError: {
        color: "red",
        marginBottom: 10
    },
    checkBox:{
        marginRight: 10,
        marginBottom: 10
    },
    blocCGU: {
        flexDirection: "row",
        alignItems: "center"
    },
    textCgu: {
        flexDirection: "column"
    },
    linkCGU:{
        color: "#00BFFF",
        textDecorationLine: "underline",
        alignSelf: "center",
        marginBottom: 10,
    },
    mandatoryFieldText: {
        alignSelf: "center",
        marginBottom: 10
    },
    mandatoryField: {
        color: "#ED0000"
    },
    iconContainer: {
        position: "absolute",
        alignSelf: "flex-end",
        right: 3,
        top: 5
    },
    icon: {
        width: 34,
        height: 34,
    },
    city: {
        backgroundColor: "white",
        padding: 5,
        borderBottomWidth: 1,
        borderColor: "black",
    },
    
    cityPressed: {
        backgroundColor: "#DEDEDE"
    },

    blocConnected: {
        flexDirection: "row"
    }
});