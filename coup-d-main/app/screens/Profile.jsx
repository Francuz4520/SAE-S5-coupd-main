import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused, CommonActions } from '@react-navigation/native';
import { auth } from "../api/Firestore";
import { getUserDocument } from "../api/firestoreService";
import Banner from "@/app/components/Banner";
import PublicationCard from '@/app/components/Home/PublicationCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate } from '../utils/date';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DefaultAvatar from "../components/DefaultAvatar";
import { signOut } from "firebase/auth";

export default function ProfileScreen({ navigation }) {

    const [user, setUser] = useState(null);
    const [publications, setPublications] = useState([]);
    const [loadingPubs, setLoadingPubs] = useState(true);
    const isFocused = useIsFocused();
    const isDesktop = Platform.OS === 'web';

    useEffect(() => {
        let unsub;
        let unsubCategories;

        async function load() {
            const current =
                JSON.parse(await AsyncStorage.getItem("user")) ||
                auth.currentUser;

            if (!current) return;

            const currentUser = await getUserDocument(current.uid);
            setUser(currentUser);

            if (!currentUser) {
                setPublications([]);
                setLoadingPubs(false);
                return;
            }

            let categoriesMap = {};

            unsubCategories = onSnapshot(
                collection(db, 'categories'),
                snap => {
                    const map = {};
                    snap.docs.forEach(d => {
                        map[d.id] = d.data().title;
                    });
                    categoriesMap = map;
                }
            );

            const q = query(
                collection(db, 'publications'),
                where('idUser', '==', currentUser.id)
            );

            setLoadingPubs(true);

            unsub = onSnapshot(q, snapshot => {
                const temp = snapshot.docs.map(d => {
                    const item = d.data();
                    return {
                        id: d.id,
                        ...item,
                        formattedDate: formatDate(item.date),
                        categoryTitle:
                            categoriesMap[item.idCategory] || 'Inconnue'
                    };
                });

                setPublications(temp);
                setLoadingPubs(false);
            });
        }

        load();

        return () => {
            unsub && unsub();
            unsubCategories && unsubCategories();
        };
    }, [isFocused]);

    const confirmSignout = () => {
        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Oui', onPress: signout },
            ]
        );
    };

    async function signout() {
        await signOut(auth);
        await AsyncStorage.removeItem('user');

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Connection' }],
            })
        );
    }

    if (!user) {
        return (
            <View style={{ flex: 1 }}>
                <Banner text="Profil" />
                <Text style={{ padding: 20 }}>Chargement…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>

            {/* HEADER FIXE */}
            {!isDesktop && 
            <Banner text="Profil" showBack={false} />
            }
            <View style={styles.profileRow}>
                <DefaultAvatar avatarKey={user.avatarKey} size={100} />
                <View style={styles.infoContainer}>
                    <Text style={styles.username}>{user.username}</Text>
                    {user.city && <Text>{user.city}</Text>}
                </View>
            </View>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("EditProfile")}
            >
                <Text style={styles.editButtonText}>
                    Modifier mon profil
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.signoutButton}
                onPress={confirmSignout}
            >
                <Text style={styles.signoutButtonText}>
                    Se déconnecter
                </Text>
            </TouchableOpacity>

            {/* ZONE SCROLLABLE */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                    Mes publications
                </Text>

                {loadingPubs && <Text>Chargement…</Text>}
                {!loadingPubs && publications.length === 0 && (
                    <Text>Aucune publication.</Text>
                )}

                {!loadingPubs && publications.length > 0 && (
                    <FlatList
                        data={publications}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        removeClippedSubviews
                        contentContainerStyle={{ paddingBottom: 30 }}
                        renderItem={({ item }) => (
                            <PublicationCard
                                item={item}
                                hideAction
                                onPress={() =>
                                    navigation.navigate(
                                        'HomeDetails',
                                        { publication: item }
                                    )
                                }
                            />
                        )}
                    />
                )}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    profileRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 20,
    },
    infoContainer: {
        flexDirection: "column",
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
    },
    editButton: {
        backgroundColor: "#29AAAB",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginHorizontal: 15,
        marginTop: 10,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "600",
    },
    signoutButton: {
        backgroundColor: "red",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginHorizontal: 15,
        marginTop: 8,
    },
    signoutButtonText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "600",
    },
    listContainer: {
        flex: 1,                 // ⭐️ CLÉ DU SCROLL
        paddingHorizontal: 15,
        marginTop: 16,
    },
    sectionTitle: {
        fontWeight: "700",
        marginBottom: 8,
    },
});
