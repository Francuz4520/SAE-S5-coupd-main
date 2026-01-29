import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Banner from "../components/Banner";
import { createReview } from "../api/firestoreService";

function clampRating(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(5, n));
}

function StarRow({ label, value, onChange }) {
    const v = clampRating(value);

    return (
        <View style={styles.starRow}>
            <Text style={styles.starLabel}>{label}</Text>
            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => onChange(i)}
                        activeOpacity={0.8}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <MaterialCommunityIcons
                            name={i <= v ? "star" : "star-outline"}
                            size={22}
                            color={i <= v ? "#f1c40f" : "#c7c7c7"}
                            style={{ marginLeft: 2 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export default function RateHelpScreen({ route, navigation }) {
    const {
        publicationId,
        publicationTitle,
        fromUserId,
        toUserId,
        toUserName,
    } = route.params || {};

    const [ratings, setRatings] = useState({
        reliability: 0,
        quality: 0,
        attitude: 0,
        communication: 0,
    });

    const [comment, setComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const overall = useMemo(() => {
        const r = clampRating(ratings.reliability);
        const q = clampRating(ratings.quality);
        const a = clampRating(ratings.attitude);
        const c = clampRating(ratings.communication);
        return (r + q + a + c) / 4;
    }, [ratings]);

    const canSubmit = useMemo(() => {
        return (
            publicationId &&
            fromUserId &&
            toUserId &&
            Object.values(ratings).some((v) => Number(v) > 0)
        );
    }, [publicationId, fromUserId, toUserId, ratings]);

    const handleSubmit = async () => {
        if (!canSubmit) {
            Alert.alert(
                "Avis incomplet",
                "Veuillez sélectionner au moins une note avant d'envoyer."
            );
            return;
        }

        setIsSaving(true);
        try {
            await createReview({
                publicationId,
                fromUserId,
                toUserId,
                ratings,
                comment,
            });

            Alert.alert("Merci !", "Votre avis a bien été envoyé.", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            if (e?.code === "review/already-exists") {
                Alert.alert("Avis déjà envoyé", "Vous avez déjà noté cet utilisateur.", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
                return;
            }
            console.error(e);
            Alert.alert("Erreur", "Impossible d'envoyer votre avis.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Banner text="Évaluer l’entraide" />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.successCard}>
                    <Text style={styles.successTitle}>Merci !</Text>
                    <Text style={styles.successText}>Le post a été complété avec succès</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.sectionHeader}>Résumé</Text>
                    {publicationTitle ? (
                        <Text style={styles.summaryText}>Titre : {publicationTitle}</Text>
                    ) : null}
                    {toUserName ? (
                        <Text style={styles.summaryText}>Participant : {toUserName}</Text>
                    ) : null}
                </View>

                <View style={styles.reviewCard}>
                    <Text style={styles.sectionHeader}>Évaluer l’entraide</Text>
                    <Text style={styles.subtitle}>Votre note pour {toUserName || "cet utilisateur"}</Text>

                    <View style={styles.overallRow}>
                        <Text style={styles.overallLabel}>Note globale</Text>
                        <Text style={styles.overallValue}>{overall.toFixed(1)}/5</Text>
                    </View>

                    <StarRow
                        label="Fiabilité"
                        value={ratings.reliability}
                        onChange={(v) => setRatings((s) => ({ ...s, reliability: v }))}
                    />
                    <StarRow
                        label="Qualité du matériel"
                        value={ratings.quality}
                        onChange={(v) => setRatings((s) => ({ ...s, quality: v }))}
                    />
                    <StarRow
                        label="Attitude / relation"
                        value={ratings.attitude}
                        onChange={(v) => setRatings((s) => ({ ...s, attitude: v }))}
                    />
                    <StarRow
                        label="Communication"
                        value={ratings.communication}
                        onChange={(v) => setRatings((s) => ({ ...s, communication: v }))}
                    />

                    <TextInput
                        style={styles.comment}
                        placeholder="Commentaire (optionnel)"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, (!canSubmit || isSaving) && styles.submitBtnDisabled]}
                        onPress={isSaving ? null : handleSubmit}
                        activeOpacity={0.85}
                        disabled={!canSubmit || isSaving}
                    >
                        <Text style={styles.submitText}>{isSaving ? "Envoi..." : "Envoyer"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 30,
        gap: 12,
    },
    successCard: {
        borderWidth: 1,
        borderColor: "#29AAAB",
        backgroundColor: "#eaf7f7",
        borderRadius: 10,
        padding: 12,
    },
    successTitle: {
        fontWeight: "700",
        color: "#1f6f70",
        marginBottom: 2,
    },
    successText: {
        color: "#1f6f70",
    },
    summaryCard: {
        borderWidth: 1,
        borderColor: "#d0d8de",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#fff",
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: "#d0d8de",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#fff",
    },
    sectionHeader: {
        color: "#29AAAB",
        fontWeight: "800",
        marginBottom: 6,
    },
    subtitle: {
        color: "#555",
        marginBottom: 10,
    },
    summaryText: {
        color: "#333",
        marginTop: 4,
    },
    overallRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    overallLabel: {
        color: "#333",
        fontWeight: "700",
    },
    overallValue: {
        color: "#333",
        fontWeight: "700",
    },
    starRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    starLabel: {
        color: "#333",
        flex: 1,
        paddingRight: 10,
    },
    stars: {
        flexDirection: "row",
        alignItems: "center",
    },
    comment: {
        borderWidth: 1,
        borderColor: "#d0d8de",
        borderRadius: 10,
        padding: 10,
        minHeight: 90,
        marginTop: 10,
        textAlignVertical: "top",
    },
    submitBtn: {
        backgroundColor: "#29AAAB",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 12,
    },
    submitBtnDisabled: {
        backgroundColor: "#bdc3c7",
    },
    submitText: {
        color: "#fff",
        fontWeight: "800",
    },
});
