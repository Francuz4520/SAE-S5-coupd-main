import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

export default function DetailBody({ title, category, date, description, city, authorName, onPressAuthor }) {
  const isDesktop = Platform.OS === 'web'
  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {/* Ligne Catégorie & Date */}
      <View style={styles.metaRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      {!!authorName && (
        <TouchableOpacity
          onPress={onPressAuthor}
          activeOpacity={0.8}
          disabled={!onPressAuthor}
          style={styles.authorRow}
        >
          <Text style={styles.authorLabel}>Posté par</Text>
          <Text style={styles.authorValue}>{authorName}</Text>
        </TouchableOpacity>
      )}
      
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
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -20,
    backgroundColor: "white",
    minHeight: 500,
  },
  containerDesktop: {
    marginTop: 0,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  categoryBadge: { backgroundColor: "#E6EFEF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  categoryText: { color: "#22788F", fontWeight: "600", fontSize: 12 },
  dateText: { color: "#888", fontSize: 12 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  authorLabel: { color: "#888", fontSize: 12 },
  authorValue: { color: "#22788F", fontSize: 12, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a1a", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#F2F2F2", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 24, color: "#555", textAlign: "justify" },
});
