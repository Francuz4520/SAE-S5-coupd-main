
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import DetailHeader from "../components/HomeDetails/DetailsHeader";
import DetailHero from "../components/HomeDetails/DetailsHero";
import DetailBody from "../components/HomeDetails/DetailsBody";
import DetailFooter from "../components/HomeDetails/DetailsFooter";

import { formatDate } from "../utils/date";

export default function HomeDetails({ route, navigation }) {
  // On récupère la donnée
  const { publication } = route.params;

  const displayDate = publication.formattedDate || formatDate(publication.date);

  // Gestionnaire d'action
  const handleActionPress = () => {
    console.log("Action sur la publication :", publication.id);
  };

  return (
    <View style={styles.container}>
      
      {/* 1. Navigation */}
      <DetailHeader 
        title={publication.title} 
        onBack={() => navigation.goBack()} 
      />

      {/* 2. Contenu Scrollable */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <DetailHero imageUri={publication.image} />
        
        <DetailBody 
          title={publication.title}
          category={publication.categoryTitle}
          date={displayDate}
          description={publication.description}
          city={publication.authorCity}
        />
      </ScrollView>

      {/* 3. Action Fixe */}
      <DetailFooter 
        isHelpRequest={publication.isHelpRequest} 
        onPress={handleActionPress} 
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
});