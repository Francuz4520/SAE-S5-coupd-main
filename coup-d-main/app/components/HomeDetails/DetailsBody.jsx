import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DetailBody({ title, category, date, description, city }) {
  return (
    <View style={styles.container}>
      {/* Ligne Catégorie & Date */}
      <View style={styles.metaRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      
      {/* Titre */}
      <Text style={styles.title}>{title}</Text>

      <View style={styles.divider} />

      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {description || "Aucune description fournie pour cette publication."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -20,
    backgroundColor: "white",
    minHeight: 500,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  categoryBadge: { backgroundColor: "#E6EFEF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  categoryText: { color: "#22788F", fontWeight: "600", fontSize: 12 },
  dateText: { color: "#888", fontSize: 12 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a1a", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#F2F2F2", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 24, color: "#555", textAlign: "justify" },
});
