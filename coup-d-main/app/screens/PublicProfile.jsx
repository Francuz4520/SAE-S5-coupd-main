import {
    Text,
    View,
    StyleSheet,
    FlatList,
    Platform,
    useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getUserDocument } from "../api/firestoreService";
import Banner from "@/app/components/Banner";
import PublicationCard from "@/app/components/Home/PublicationCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../api/Firestore";
import { formatDate } from "../utils/date";
import DefaultAvatar from "../components/DefaultAvatar";

export default function PublicProfileScreen({ navigation, route }) {
    const { userId } = route.params || {};

    const [user, setUser] = useState(null);
    const [publications, setPublications] = useState([]);
    const [loadingPubs, setLoadingPubs] = useState(true);
    const isFocused = useIsFocused();
    const isDesktop = Platform.OS === "web";
    const { width } = useWindowDimensions();

    useEffect(() => {
        let unsub;
        let unsubCategories;

        async function load() {
            if (!userId) return;

            const targetUser = await getUserDocument(userId);
            setUser(targetUser);

            if (!targetUser) {
                setPublications([]);
                setLoadingPubs(false);
                return;
            }

            let categoriesMap = {};

            unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
                const map = {};
                snap.docs.forEach((d) => {
                    map[d.id] = d.data().title;
                });
                categoriesMap = map;
            });

            const q = query(
                collection(db, "publications"),
                where("idUser", "==", targetUser.id)
            );

            setLoadingPubs(true);

            unsub = onSnapshot(q, (snapshot) => {
                const temp = snapshot.docs.map((d) => {
                    const item = d.data();
                    return {
                        id: d.id,
                        ...item,
                        formattedDate: formatDate(item.date),
                        categoryTitle: categoriesMap[item.idCategory] || "Inconnue",
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
    }, [isFocused, userId]);

    return (
        <View style={{ flex: 1 }}>
            <Banner text="Profil" />

            {!userId && <Text style={{ padding: 20 }}>Utilisateur introuvable.</Text>}

            {userId && !user && (
                <Text style={{ padding: 20 }}>Chargement…</Text>
            )}

            {user && (
                <>
                    <View style={styles.profileRow}>
                        <DefaultAvatar avatarKey={user.avatarKey} size={100} />
                        <View style={styles.infoContainer}>
                            <Text style={styles.username}>{user.username}</Text>
                            {user.city && <Text>{user.city}</Text>}
                            <ReputationRow user={user} />
                        </View>
                    </View>

                    <View style={styles.listContainer}>
                        <Text style={styles.sectionTitle}>Publications</Text>

                        {loadingPubs && <Text>Chargement…</Text>}
                        {!loadingPubs && publications.length === 0 && (
                            <Text>Aucune publication.</Text>
                        )}

                        {!loadingPubs && publications.length > 0 && (
                            <FlatList
                                data={publications}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                                removeClippedSubviews
                                contentContainerStyle={[
                                    styles.flatlist,
                                    isDesktop && width > 775 && styles.flatlistDesktop,
                                ]}
                                renderItem={({ item }) => (
                                    <PublicationCard
                                        item={item}
                                        hideAction
                                        onPress={() =>
                                            navigation.navigate("HomeDetails", {
                                                publication: item,
                                            })
                                        }
                                    />
                                )}
                            />
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

function ReputationRow({ user }) {
    const rep = user?.reputation || {};
    const repCount = Number(rep.count || 0);
    const repOverall = repCount > 0 ? Number(rep.sumOverall || 0) / repCount : 0;
    const stars = Math.round(repOverall);

    return (
        <View style={styles.reputationRow}>
            {repCount > 0 ? (
                <>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <MaterialCommunityIcons
                                key={i}
                                name={i <= stars ? "star" : "star-outline"}
                                size={18}
                                color={i <= stars ? "#f1c40f" : "#c7c7c7"}
                            />
                        ))}
                    </View>
                    <Text style={styles.reputationText}>
                        {repOverall.toFixed(1)}/5 ({repCount} avis)
                    </Text>
                </>
            ) : (
                <Text style={styles.reputationText}>Aucun avis</Text>
            )}
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
        flex: 1,
    },
    reputationRow: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    reputationText: {
        color: "#555",
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 16,
    },
    sectionTitle: {
        fontWeight: "700",
        marginBottom: 8,
    },
    flatlist: {
        paddingBottom: 30,
    },
    flatlistDesktop: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
});
