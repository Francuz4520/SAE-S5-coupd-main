import {Text, View, StyleSheet, Image, TouchableOpacity} from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused } from '@react-navigation/native';
import { auth } from "../api/Firestore";
import { getUserDocument } from "../api/firestoreService";
import Banner from "@/app/components/Banner";
import DetailHeader from "@/app/components/HomeDetails/DetailsHeader";
export default function ProfileScreen({navigation}) {

    const [user, setUser] = useState(null);
    const isFocused = useIsFocused();
    useEffect(() => {
        async function load() {
            const current = auth.currentUser;
            if (!current) return;

            const data = await getUserDocument(current.uid);
            console.log("Données Firestore :", data);
            setUser(data);
        }
        load();
    }, [isFocused]);

    if(!user){
        return (
            <View>
                <Banner>Profil</Banner>
                <Text>chargement</Text>
            </View>
        );
    }
  return (
    <View>
        <Banner text={"Profil"} showBack={false}></Banner>

        <View style={styles.profileRow}>
            {/* Avatar */}
            <Image
                source={{
                    uri: user.avatarUrl
                        ? user.avatarUrl
                        : "https://i.pravatar.cc/150",
                }}
                style={styles.avatar}
            />

            {/* Infos utilisateur */}
            <View style={styles.infoContainer}>
                <Text style={styles.username}>{user.username}</Text>
                {user.city && <Text style={styles.city}>{user.city}</Text>}
            </View>
        </View>
        <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
        >
            <Text style={styles.editButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    profileRow: {
        flexDirection: "row",        // avatar + infos sur la même ligne
        alignItems: "center",
        paddingHorizontal: 20,
        gap : 20,
    },
    infoContainer: {
        flexDirection: "column",     // empile username & city
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 60,

        marginBottom: 15,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
    },
    editButton: {
        backgroundColor: "#29AAAB",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },

    editButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "semibold",
        textAlign: "center"
    },
});