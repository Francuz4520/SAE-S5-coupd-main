import {View, Image, StyleSheet, Text, Button, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert} from "react-native"
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail} from "firebase/auth";
import { useKeyboard } from "@react-native-community/hooks";
import { Checkbox } from 'expo-checkbox';

export default function ConnectionScreen({navigation}){
    const [email, setEmail] = useState();//"anthony.iem@gmail.com"
    const [password, setPassword] = useState();//"Anto1234!"
    const [errors, setErrors] = useState({})
    const [stayConnected, setStayConnected] = useState(false);
    const keyboard = useKeyboard();
    const isDesktop = Platform.OS === "web";
    

    const firebaseErrors ={
        "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
        "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
        "auth/missing-email": "Veuillez saisir une adresse mail",
        "auth/missing-password": "Veuillez saisir un mot de passe.",
        "auth/wrong-password": "Mot de passe invalide",
        "auth/invalid-credential" : "Email ou mot de passe incorrect.",
        "auth/too-many-requests":"Nombre d'essais dépassé. Réessayez plus tard."
    }

    function handleSignin(){
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Utilisateur connecté " + user.email)
            if(stayConnected) AsyncStorage.setItem("user", JSON.stringify(user));
            navigation.navigate("Home")
        })
        .catch((error) => {
            let errors = {}
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Echec de connexion de l'utilisateur : " + errorCode + " => " + errorMessage)
    
            if(errorCode.includes("email")){errors.email = firebaseErrors[errorCode]}
            if(errorCode.includes("password")){errors.password = firebaseErrors[errorCode]}
            if(errorCode.includes("credential") || errorCode.includes("requests")){errors.account = firebaseErrors[errorCode]}
            setErrors(errors); 
        });
    }

    function forgottenPassword(){
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
        .then(() => {
            setErrors([])
            Alert.alert(
                "Mot de passe oublié",
                `Un email de réinitialisation a été envoyé à : ${email}` ,
                [{ text: "OK" }],
                { cancelable: false }
            );
        })
        .catch((error) => {
            console.log("erreur reset password", error.message)
            let errors = {}
            const errorCode = error.code;
            if(errorCode.includes("email")){errors.email = firebaseErrors[errorCode]}
            if(errorCode.includes("credential") || errorCode.includes("requests")){errors.account = firebaseErrors[errorCode]}
            setErrors(errors); 
        });
    }   

    return(
        <KeyboardAvoidingView style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <View style={[styles.container,isDesktop && styles.containerDesktop]}>
            <View> 
                {!keyboard.keyboardShown && <Image style={styles.logo}source={require("../../assets/images/logo_coup-dmain.png")} />}
                <Text style={styles.title}>Se connecter</Text>
                <Pressable style={styles.btnGoogle}>
                    <Image style={styles.logoGoogle}source={require("../../assets/images/logo_google.png")}></Image>
                    <Text>Continuer avec Google</Text>
                </Pressable>
                <View style={styles.orSeparation}>
                    <View style={styles.line}></View>
                    <View><Text style={{marginHorizontal: 10}}>OU</Text></View>
                    <View style={styles.line}></View>
                </View>
                <Text>Email</Text>
                <TextInput style={[styles.input, isDesktop && styles.inputDesktop]} value={email} onChangeText={setEmail} autoCapitalize="none" inputMode="email"/>
                {errors.email && <Text style={styles.textError}>{errors.email}</Text>}
                <Text>Mot de passe</Text>
                <TextInput style={[styles.input, isDesktop && styles.inputDesktop]} value={password} onChangeText={setPassword} autoCapitalize="none" secureTextEntry/>
                {errors.password && <Text style={styles.textError}>{errors.password}</Text>}
                <Pressable onPress={forgottenPassword}>
                    <Text style={styles.link}>Mot de passe oublié ?</Text>
                </Pressable>
                {errors.account && <Text style={styles.textError}>{errors.account}</Text>}
                <View style={styles.blocCGU}>
                    <Checkbox style={styles.checkBox} value={stayConnected} onValueChange={setStayConnected}></Checkbox>
                    <Text>Rester connecté</Text>
                </View>
                <Pressable style={styles.btnConnection} onPress={handleSignin}>
                    <Text style={styles.btnConnectionText} >Se connecter</Text>
                </Pressable>
                <Text style={styles.noAccountText}>Vous n'avez pas de compte ?</Text>
                <Pressable onPress={() => navigation.navigate('Registration')}>
                    <Text style={styles.linkCreateAccount}>Créer un compte</Text>
                </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    containerDesktop: {
        width: "30%",
        alignSelf: "center",
    },
    logo:{
        alignSelf: "center",
        height: 175,
        width: 120
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20
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
    inputDesktop: {
        padding: 10,
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
    },
    btnConnectionText:{
        color: "white",
        fontSize: 18
    },
    noAccountText: {
        alignSelf: "center",
        marginBottom: 7,
        marginTop: 35
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
    blocCGU: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    checkBox:{
        marginRight: 10
    },
    
});