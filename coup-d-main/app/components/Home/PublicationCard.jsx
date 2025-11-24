import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function PublicationCard({ item, onPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.type}>
        {item.isHelpRequest ? "Demande d'aide" : "Proposition"} · <Text style={styles.date}>{item.formattedDate}</Text>
      </Text>

      <Text style={styles.title}>{item.title}</Text>

      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}

      <View style={styles.footer}>
        <View style={styles.category}>
          <Text style={styles.categoryText}>{item.categoryTitle}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>
            {item.isHelpRequest ? "Je m'engage" : "Demander"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
});
