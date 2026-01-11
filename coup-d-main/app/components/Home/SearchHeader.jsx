import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

export default function SearchHeader({ 
  step, setStep, 
  filterType, setFilterType, 
  filterAddress, setFilterAddress, 
  filterCategory, setFilterCategory,
  searchText, setSearchText,
  categoriesList, 
  onApply, onReset 
}) {
  
  // ETAPE 0 : FERMÉ
  if (step === 0) {
    return (
      <TouchableOpacity style={styles.searchBox} activeOpacity={0.9} onPress={() => setStep(1)}>
        <Text style={{ marginRight: 10 }}>🔍</Text>
        <Text style={styles.placeholderText}>
          {filterType ? "Résultats filtrés..." : "Rechercher..."}
        </Text>
        {filterType && (
          <TouchableOpacity onPress={onReset}>
            <Text style={{ color: 'red', fontWeight: 'bold', marginLeft: 10 }}>X</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // ETAPE 1 : TYPE
  if (step === 1) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Que recherchez-vous ?</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.typeBtn, { bg: '#E1F5FE' }]} onPress={() => { setFilterType('offer'); setStep(2); }}>
            <Text style={styles.btnTxt}>🤝 Propositions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, { bg: '#FFF3E0' }]} onPress={() => { setFilterType('request'); setStep(2); }}>
            <Text style={styles.btnTxt}>🙏 Demandes</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onReset} style={styles.cancel}><Text style={styles.white}>Annuler</Text></TouchableOpacity>
      </View>
    );
  }

  // ETAPE 2 : CRITÈRES
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Filtrer les {filterType === 'offer' ? "offres" : "demandes"}</Text>
      
      {/* 1. NOUVEAU CHAMP RECHERCHE SÉMANTIQUE */}
      <TextInput 
        placeholder="Objet, outil, service... (ex: cisaille)" 
        style={styles.input} 
        value={searchText} 
        onChangeText={setSearchText} 
      />

      {/* 2. CHAMP VILLE EXISTANT */}
      <TextInput 
        placeholder="Ville..." 
        style={styles.input} 
        value={filterAddress} 
        onChangeText={setFilterAddress} 
      />
      
      <Text style={styles.label}>Catégorie :</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        <Chip label="Toutes" active={filterCategory === null} onPress={() => setFilterCategory(null)} />
        {categoriesList.map(cat => (
          <Chip key={cat.id} label={cat.title} active={filterCategory === cat.id} onPress={() => setFilterCategory(cat.id)} />
        ))}
      </ScrollView>

      <View style={styles.row}>
        <TouchableOpacity onPress={onReset} style={{ padding: 10 }}><Text style={styles.white}>Annuler</Text></TouchableOpacity>
        <TouchableOpacity onPress={onApply} style={styles.validateBtn}><Text style={styles.validateTxt}>Voir les résultats</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// Petit sous-composant interne pour les "Chips"
const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  searchBox: { backgroundColor: "white", padding: 12, borderRadius: 15, flexDirection: "row", alignItems: "center" },
  placeholderText: { color: "#888" },
  panel: { width: '100%' },
  title: { color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  typeBtn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: 'white' }, 
  
  input: { backgroundColor: 'white', borderRadius: 10, padding: 10, marginBottom: 10 },
  label: { color: 'white', fontWeight: '600' },
  white: { color: 'white' },
  cancel: { alignSelf: 'center', marginTop: 10 },
  validateBtn: { backgroundColor: 'white', padding: 10, borderRadius: 10 },
  validateTxt: { color: '#29AAAB', fontWeight: 'bold' },
  chip: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: 'white' },
  chipTxt: { color: '#E0F7FA' },
  chipTxtActive: { color: '#29AAAB', fontWeight: 'bold' },
});
