import {View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, ScrollView, Platform, Alert, Image} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Banner from "../components/Banner";
import CitySelector from "../components/CitySelector";
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../api/Firestore';
import { getUserDocument, updateUserDocument } from '../api/firestoreService';
import { triggerAutoComplete, cityExists } from '../utils/handleCities';

export default function EditProfile() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [city, setCity] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateText, setDateText] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [cities, setCities] = useState([]);
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function load() {
            const current = auth.currentUser;
            if (!current) return;
            const data = await getUserDocument(current.uid);
            if (data) {
                setUser(data);
                setFirstname(data.firstname || '');
                setLastname(data.lastname || '');
                setUsername(data.username || '');
                setCity(data.city || '');
                setPhoneNumber(data.phoneNumber || '');
                if (data.dateOfBirth) {
                    const d = data.dateOfBirth.toDate ? data.dateOfBirth.toDate() : new Date(data.dateOfBirth);
                    setDateOfBirth(d);
                    setDateText(d.toLocaleDateString());
                }
            }
        }
        load();
    }, []);

    const onChangeDate = (event, selectedDate) => {
        setShow(false);
        if (selectedDate) {
            setDateOfBirth(selectedDate);
            setDateText(selectedDate.toLocaleDateString());
        }
    }

    function createDateWithText(text){
        setDateText(text);
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

    function checkInputs(){
        let validationErrors = {};
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\-]+$/;
        const phoneNumberRegex = /^0[1-9]\d{8}$/;
        if(firstname === "") validationErrors.firstname = "Le prénom doit être renseigné.";
        else if (!nameRegex.test(firstname)) validationErrors.firstname = "Le prénom ne doit contenir que des lettres.";
        if(lastname === "") validationErrors.lastname = "Le nom doit être renseigné.";
        else if (!nameRegex.test(lastname)) validationErrors.lastname = "Le nom ne doit contenir que des lettres.";
        if(username === "") validationErrors.username = "Le nom d'utilisateur doit être renseigné.";
        if(dateOfBirth === null || dateOfBirth > new Date()) validationErrors.dateOfBirth = "La date de naissance n'est pas valide.";
        if(city === "") validationErrors.city = "La ville doit être renseignée.";
        else if(!cityExists(city)) validationErrors.city = "La ville n'est pas valide.";
        if(phoneNumber !== "" && !phoneNumberRegex.test(phoneNumber)) validationErrors.phoneNumber = "Le numéro de téléphone n'est pas valide";
        return validationErrors;
    }

    async function handleSave(){
        const current = auth.currentUser;
        if (!current) return;
        const validationErrors = checkInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const fields = { firstname, lastname, username, city, dateOfBirth: dateOfBirth ? dateOfBirth : null };
        if (phoneNumber) fields.phoneNumber = phoneNumber;
        try {
            await updateUserDocument(current.uid, fields);
            Alert.alert("Profil mis à jour", "Votre profil a bien été mis à jour.", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
            console.error(error);
        }
    }

    if (!user) {
        return (
            <View style={{flex:1}}>
                <Banner text={"Modifier votre profil"} showBack={true} onBack={() => navigation.goBack()}></Banner>
                <Text style={{padding:16}}>Chargement...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
                <Banner text={"Modifier votre profil"} showBack={true} onBack={() => navigation.goBack()}></Banner>

                <Text style={styles.sectionTitle}>Nom</Text>
                <TextInput style={styles.input} value={lastname} onChangeText={setLastname} />
                {errors.lastname && <Text style={styles.textError}>{errors.lastname}</Text>}

                <Text style={styles.sectionTitle}>Prénom</Text>
                <TextInput style={styles.input} value={firstname} onChangeText={setFirstname} />
                {errors.firstname && <Text style={styles.textError}>{errors.firstname}</Text>}

                <Text style={styles.sectionTitle}>Nom d'utilisateur</Text>
                <TextInput style={styles.input} value={username} onChangeText={setUsername} />
                {errors.username && <Text style={styles.textError}>{errors.username}</Text>}

                <Text style={styles.sectionTitle}>Date de naissance</Text>
                <View>
                    <TextInput style={styles.input} value={dateText} onChangeText={(text) => createDateWithText(text)} />
                    <Pressable onPress={() => setShow(true)} style={styles.iconContainer}><Image style={styles.icon} source={require("../../assets/icons/calendar.png")} /></Pressable>
                </View>
                {show && (
                    <DateTimePicker value={dateOfBirth ?? new Date()} mode="date" display="default" onChange={onChangeDate} />
                )}
                {errors.dateOfBirth && <Text style={styles.textError}>{errors.dateOfBirth}</Text>}

                <Text style={styles.sectionTitle}>Ville</Text>
                <TextInput style={styles.input} value={city} onChangeText={(text) => { setCity(text); setCities(triggerAutoComplete(text)); }} />
                <CitySelector cities={cities} setCity={setCity} setCities={setCities}></CitySelector>
                {errors.city && <Text style={styles.textError}>{errors.city}</Text>}

                <Text style={styles.sectionTitle}>Numéro de téléphone</Text>
                <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} inputMode="tel" />
                {errors.phoneNumber && <Text style={styles.textError}>{errors.phoneNumber}</Text>}

                <Pressable style={styles.btnSave} onPress={handleSave}><Text style={styles.btnSaveText}>Enregistrer</Text></Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

    input: {
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        marginBottom: 10,
        marginHorizontal : 5,
        padding: 8,
    },
    btnSave: {
        backgroundColor: '#29AAAB',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    btnSaveText: { color: '#fff', fontWeight: '600' },
    textError: { color: 'red', marginBottom: 10 },
    iconContainer: { position: 'absolute', alignSelf: 'flex-end', right: 3, top: 5 },
    icon: { width: 28, height: 28 },
    sectionTitle: { marginTop: 10, marginBottom: 4, marginHorizontal:5, }
});