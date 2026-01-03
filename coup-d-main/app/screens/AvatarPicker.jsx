import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DEFAULT_AVATARS } from "../constants/defaultAvatars";

import { doc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

export default function AvatarPicker({ route, navigation }) {
    const { uid } = route.params;
    const [selected, setSelected] = useState("a1");


    const firebaseConfig = {
        apiKey: "AIzaSyCiMQX0w9x738U1bTYi75EaxncHe0BU_IY",
        authDomain: "saecoupdmain.firebaseapp.com",
        projectId: "saecoupdmain",
        storageBucket: "saecoupdmain.firebasestorage.app",
        messagingSenderId: "51236011687",
        appId: "1:51236011687:web:355ca4439aaf49f430a582"
    };

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const saveAvatar = async () => {
    await setDoc(
        doc(db, "users", uid),
        { avatarKey: selected },
        { merge: true }
    );
    navigation.replace("Home");
    };

    const renderItem = ({ item }) => {
    const isActive = item.id === selected;
    return (
        <Pressable
        onPress={() => setSelected(item.id)}
        style={[
            styles.avatar,
            { backgroundColor: item.bg },
            isActive && styles.avatarActive,
        ]}
        >
        <MaterialCommunityIcons name={item.icon} size={34} color="#222" />
        </Pressable>
    );
    };

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Choisis ton avatar</Text>
        <Text style={styles.subtitle}>Tu pourras le changer plus tard.</Text>

        <FlatList
        data={DEFAULT_AVATARS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
        />

        <Pressable style={styles.btn} onPress={saveAvatar}>
        <Text style={styles.btnText}>Continuer</Text>
        </Pressable>
    </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "700" },
    subtitle: { marginTop: 6, opacity: 0.7 },
    avatar: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    avatarActive: {
        borderColor: "#29AAAB",
        borderWidth: 3,
    },
    btn: {
        backgroundColor: "#29AAAB",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    btnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
