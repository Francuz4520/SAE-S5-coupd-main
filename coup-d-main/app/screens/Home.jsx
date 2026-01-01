import React, { useState, useMemo, useEffect } from "react";
import { View, FlatList, StyleSheet, Keyboard } from "react-native";
import { usePublications } from "../hooks/usePublications";
import SearchHeader from "../components/Home/SearchHeader";
import PublicationCard from "../components/Home/PublicationCard";
import { PUB_STATES } from "../constants/states";

export default function HomeScreen({ navigation }) {
  // 1. Données
  const { data, categoriesList, loading } = usePublications();

  // 2. États de recherche
  const [searchStep, setSearchStep] = useState(0);
  const [filterType, setFilterType] = useState(null);
  const [filterAddress, setFilterAddress] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  
  // État pour stocker les filtres appliqués
  const [appliedFilters, setAppliedFilters] = useState(null);

  // 3. Logique de filtrage
  const filteredData = useMemo(() => {
    // 1. Premier niveau de filtre : On ne veut QUE les status "open"
    const openData = data.filter(item => item.state === PUB_STATES.OPEN);

    // Si aucun filtre utilisateur appliqué, on retourne les données ouvertes
    if (!appliedFilters) return openData;

    return openData.filter((item) => {
      const { type, category, address } = appliedFilters;
      
      // Filtre Type
      const typeMatch = type === 'request' ? item.isHelpRequest : !item.isHelpRequest;
      // Filtre Catégorie
      const catMatch = category ? item.idCategory === category : true;
      // Filtre Adresse
      const addrMatch = address 
        ? (item.authorCity || "").toLowerCase().includes(address.toLowerCase())
        : true;

      return typeMatch && catMatch && addrMatch;
    });
  }, [data, appliedFilters]);

  // 4. Handlers
  const handleApplySearch = () => {
    setAppliedFilters({
      type: filterType,
      category: filterCategory,
      address: filterAddress
    });
    setSearchStep(0);
    Keyboard.dismiss();
  };

  const handleResetSearch = () => {
    setSearchStep(0);
    setFilterType(null);
    setFilterAddress("");
    setFilterCategory(null);
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
