
import React, {useEffect, useState} from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import DetailHeader from "../components/HomeDetails/DetailsHeader";
import DetailHero from "../components/HomeDetails/DetailsHero";
import DetailBody from "../components/HomeDetails/DetailsBody";
import DetailFooter from "../components/HomeDetails/DetailsFooter";

import { formatDate } from "../utils/date";
import { auth } from '../api/Firestore';
import { deletePublication, setPublicationFinished } from '../api/firestoreService';

export default function HomeDetails({ route, navigation }) {
  // On récupère la donnée
  const { publication } = route.params;
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function checkIsOwner() {
      const user = JSON.parse(await AsyncStorage.getItem("user")) || auth.currentUser;
      const isOwner = publication.idUser === user.uid;
      setIsOwner(isOwner);
    }
    checkIsOwner();
  }, []);

  const displayDate = publication.formattedDate || formatDate(publication.date);

  // Gestionnaire d'action
  const handleActionPress = () => {
    console.log("Action sur la publication :", publication.id);
    console.log("ID de l'auteur :", publication.idUser);
    navigation.navigate('Chat', { interlocutors: [publication.idUser] });
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer cette publication ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await deletePublication(publication.id);
          navigation.goBack();
        } catch (e) {
          console.error(e);
          Alert.alert('Erreur', "Impossible de supprimer la publication.");
        }
      } }
    ]);
  };

  const handleFinish = async () => {
    try {
      await setPublicationFinished(publication.id, true);
      Alert.alert('Publication terminée', 'La publication a été marquée comme terminée.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible de marquer la publication comme terminée.");
    }
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
        isOwner={isOwner}
        onDelete={handleDelete}
        onFinish={handleFinish}
        isFinished={publication.isFinished}
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