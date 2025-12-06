import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function PublicationCard({ item, onPress, hideActionWhenFinished = true, hideAction = false }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.type}>
            {item.isHelpRequest ? "Demande d'aide" : "Proposition"} ·{" "}
            <Text style={styles.date}>{item.formattedDate}</Text>
          </Text>
          {typeof item.isFinished !== 'undefined' && (
            <View style={[styles.statusPill, item.isFinished ? styles.finished : styles.ongoing]}>
              <Text style={styles.statusText}>{item.isFinished ? 'Terminé' : 'En cours'}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{item.title}</Text>

        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        <View style={styles.footer}>
          <View style={styles.category}>
            <Text style={styles.categoryText}>{item.categoryTitle}</Text>
          </View>

          {!(hideAction || (hideActionWhenFinished && item.isFinished)) && (
            <TouchableOpacity style={styles.button} onPress={onPress}>
              <Text style={styles.buttonText}>
                {item.isHelpRequest ? "Je m'engage" : "Demander"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white", borderRadius: 18, marginTop: 8, marginBottom: 5,
    marginHorizontal: 15, padding: 15, borderWidth: 1, borderColor: "#D7EBF0",
  },
  type: { color: "#0B8CBF", fontWeight: "bold" },
  date: { color: "#22788F", fontWeight: 'normal' },
  title: { marginTop: 5, marginBottom: 10, fontSize: 16 },
  image: { width: "100%", height: 130, borderRadius: 12, marginBottom: 10 },
  footer:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  category: { backgroundColor: "#E6EFEF", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginRight: 8 },
  categoryText: { fontSize: 12, color: "#555" },
  cityText: { fontSize: 10, color: '#888', marginRight: 5 },
  button: { backgroundColor: "white", borderWidth: 1, borderColor: "#60B4E0", paddingVertical: 6, paddingHorizontal: 15, borderRadius: 10 },
  buttonText: { color: "#1D8CD1", fontWeight: "600" },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  finished: { backgroundColor: '#2ecc71' },
  ongoing: { backgroundColor: '#f39c12' },
});