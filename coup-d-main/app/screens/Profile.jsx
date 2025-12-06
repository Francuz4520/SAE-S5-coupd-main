import {Text, View, StyleSheet, Image, TouchableOpacity, FlatList} from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused } from '@react-navigation/native';
import { auth } from "../api/Firestore";
import { getUserDocument } from "../api/firestoreService";
import Banner from "@/app/components/Banner";
import DetailHeader from "@/app/components/HomeDetails/DetailsHeader";
import PublicationCard from '@/app/components/Home/PublicationCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate } from '../utils/date';
export default function ProfileScreen({navigation}) {

    const [user, setUser] = useState(null);
    const isFocused = useIsFocused();
    const [publications, setPublications] = useState([]);
    const [loadingPubs, setLoadingPubs] = useState(true);
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

    useEffect(() => {
        // load user's publications when profile is focused
        const current = auth.currentUser;
        if (!current) {
            setPublications([]);
            setLoadingPubs(false);
            return;
        }

        // first load categories to map id->title
        let categoriesMap = {};
        const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
            const map = {};
            snap.docs.forEach(d => { map[d.id] = d.data().title; });
            categoriesMap = map;
        });

        const q = query(
            collection(db, 'publications'),
            where('idUser', '==', current.uid),
            //where('isFinished', '==', true) si on veux que les publication terminer
        );
        setLoadingPubs(true);
        const unsub = onSnapshot(q, async (snapshot) => {
            const temp = snapshot.docs.map(d => {
                const item = d.data();
                return {
                    id: d.id,
                    ...item,
                    formattedDate: formatDate(item.date),
                    categoryTitle: categoriesMap[item.idCategory] || 'Inconnue'
                };
            });
            setPublications(temp);
            setLoadingPubs(false);
        });

        return () => {
            unsub && unsub();
            unsubCategories && unsubCategories();
        };
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
    <View style={{flex:1}}>
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

        <View style={{marginTop:16, paddingHorizontal:15}}>
            <Text style={{fontWeight:'700', marginBottom:8}}>Mes publications</Text>
            {loadingPubs && <Text>Chargement des publications...</Text>}
            {!loadingPubs && publications.length === 0 && <Text>Aucune publication pour le moment.</Text>}
            {!loadingPubs && publications.length > 0 && (
                <FlatList
                    data={publications}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <PublicationCard item={item} onPress={() => navigation.navigate('HomeDetails', { publication: item } )} hideAction={true}/>
                    )}
                />
            )}
        </View>
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