import React, { useState, useMemo, useEffect } from "react";
import { View, FlatList, StyleSheet, Keyboard } from "react-native";
import { usePublications } from "../hooks/usePublications";
import SearchHeader from "../components/Home/SearchHeader";
import PublicationCard from "../components/Home/PublicationCard";
import { PUB_STATES } from "../constants/states";

import { expandSearchTerm, matchSemantic } from "../utils/synonymsDict";

export default function HomeScreen({ navigation }) {
  // 1. Données
  const { data, categoriesList, loading } = usePublications();

  // 2. États de recherche
  const [searchStep, setSearchStep] = useState(0);
  const [filterType, setFilterType] = useState(null);
  const [filterAddress, setFilterAddress] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  
  // État pour stocker les filtres appliqués
  const [appliedFilters, setAppliedFilters] = useState(null);

  // 3. Logique de filtrage
  const filteredData = useMemo(() => {
    // 1. Filtrer les publications ouvertes
    const openData = data.filter(item => item.state === PUB_STATES.OPEN);

    if (!appliedFilters) return openData;

    return openData.filter((item) => {
      // Récupération des filtres
      const { type, category, address, text } = appliedFilters;
      
      // 1. Filtre Type
      const typeMatch = type === 'request' ? item.isHelpRequest : !item.isHelpRequest;
      
      // 2. Filtre Catégorie
      const catMatch = category ? item.idCategory === category : true;
      
      // 3. Filtre Adresse
      const addrMatch = address 
        ? (item.authorCity || "").toLowerCase().includes(address.toLowerCase())
        : true;

      // 4. Filtre Sémantique
      let textMatch = true;
      if (text && text.trim().length > 0) {
        // A. On étend le terme
        const semanticTerms = expandSearchTerm(text);
        
        // B. On cherche dans le titre ET la description
        // On combine titre et description pour une recherche unique
        const contentToSearch = (item.title + " " + (item.description || "")).toLowerCase();
        
        // C. Vérification
        textMatch = matchSemantic(contentToSearch, semanticTerms);
      }

      return typeMatch && catMatch && addrMatch && textMatch;
    });
  }, [data, appliedFilters]);

  // 4. Handlers
  const handleApplySearch = () => {
    setAppliedFilters({
      type: filterType,
      category: filterCategory,
      address: filterAddress,
      text: searchText
    });
    setSearchStep(0);
    Keyboard.dismiss();
  };

  const handleResetSearch = () => {
    setSearchStep(0);
    setFilterType(null);
    setFilterAddress("");
    setFilterCategory(null);
    setSearchText("");
    setAppliedFilters(null);
  };

  return (
    <View style={styles.container}>
      {/* HEADER DÉLÉGUÉ */}
      <View style={[styles.header, searchStep > 0 && styles.headerExpanded]}>
        <SearchHeader 
          step={searchStep}
          setStep={setSearchStep}
          filterType={filterType}
          setFilterType={setFilterType}
          filterAddress={filterAddress}
          setFilterAddress={setFilterAddress}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchText={searchText}
          setSearchText={setSearchText}
          categoriesList={categoriesList}
          onApply={handleApplySearch}
          onReset={handleResetSearch}
        />
      </View>

      {/* LISTE DÉLÉGUÉE */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        // On passe la navigation au composant enfant
        renderItem={({ item }) => (
          <PublicationCard 
            item={item} 
            onPress={() => navigation.navigate("HomeDetails", { publication: item })} 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F8FB" },
  header: {
    backgroundColor: "#29AAAB",
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 15,
    marginBottom: 7,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerExpanded: { paddingBottom: 20 },
});
