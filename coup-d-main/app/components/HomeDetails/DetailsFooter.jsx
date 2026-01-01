import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PUB_STATES } from "../../constants/states";

export default function DetailFooter({ isHelpRequest, onPress, isOwner = false, onDelete, onFinish, state}) {
  const isFinished = state === PUB_STATES.FINISHED;

  // If current user is owner, show Delete + Finish buttons, else show Contact
  return (
    <View style={styles.footer}>
      {isOwner ? (
        <View style={styles.ownerRow}>
          <TouchableOpacity style={[styles.ownerButton, styles.deleteButton]} onPress={onDelete} activeOpacity={0.8}>
            <Text style={styles.ownerButtonText}>Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ownerButton, isFinished ? styles.finishDisabled : styles.finishButton]}
            onPress={isFinished ? null : onFinish}
            activeOpacity={0.8}
            disabled={isFinished}
          >
            <Text style={styles.ownerButtonText}>{isFinished ? 'Terminé' : 'Terminer'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
            style={[styles.actionButton, isFinished && styles.actionDisabled]} 
            onPress={isFinished ? null : onPress} 
            activeOpacity={0.8}
            disabled={isFinished}
        >
          <Text style={styles.actionButtonText}>
            {isFinished ? "Publication terminée" : "Contacter"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    backgroundColor: "#29AAAB",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#29AAAB",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  actionDisabled: {
      backgroundColor: "#bdc3c7",
      elevation: 0
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },

  ownerRow: { flexDirection: 'row', gap: 12 },
  ownerButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  deleteButton: { backgroundColor: '#e74c3c' },
  finishButton: { backgroundColor: '#27ae60' },
  finishDisabled: { backgroundColor: '#95a5a6' },
  ownerButtonText: { color: 'white', fontWeight: '700' },
});