
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import DetailHeader from "../components/HomeDetails/DetailsHeader";
import DetailHero from "../components/HomeDetails/DetailsHero";
import DetailBody from "../components/HomeDetails/DetailsBody";
import DetailFooter from "../components/HomeDetails/DetailsFooter";

import { formatDate } from "../utils/date";
import { auth } from '../api/Firestore';
import { deletePublication, updatePublicationState, getUserDocument } from '../api/firestoreService';
import { PUB_STATES } from "../constants/states";
import DefaultAvatar from "../components/DefaultAvatar";

export default function HomeDetails({ route, navigation }) {
  // On récupère la donnée
  const { publication } = route.params;
  const [isOwner, setIsOwner] = useState(false);
  const [author, setAuthor] = useState(null);
  const isDesktop = Platform.OS === 'web'
  const {width} = useWindowDimensions();
  const isFinished = publication.state === PUB_STATES.FINISHED;

  useEffect(() => {
    async function checkIsOwner() {
      const user = JSON.parse(await AsyncStorage.getItem("user")) || auth.currentUser;
      const isOwner = publication.idUser === user.uid;
      setIsOwner(isOwner);
    }
    checkIsOwner();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadAuthor() {
      try {
        if (!publication?.idUser) return;
        const userDoc = await getUserDocument(publication.idUser);
        if (mounted) setAuthor(userDoc);
      } catch (e) {
        console.error("Erreur loadAuthor:", e);
      }
    }
    loadAuthor();
    return () => {
      mounted = false;
    };
  }, [publication?.idUser]);

  const displayDate = publication.formattedDate || formatDate(publication.date);

  const authorName = author
    ? (author.username || `${author.firstname || ""} ${author.lastname || ""}`.trim())
    : "";

  const authorAvatarUri =
    author?.photoURL ||
    author?.avatarUrl ||
    author?.avatarURI ||
    author?.profilePhoto ||
    author?.profilePicture ||
    author?.avatar ||
    author?.imageUrl ||
    author?.image ||
    null;

  // Gestionnaire d'action
  const handleActionPress = () => {
    console.log("Action sur la publication :", publication.id);
    console.log("ID de l'auteur :", publication.idUser);
    navigation.navigate("Chat", { interlocutors: [publication.idUser], publicationID: publication.id});
  };

  const handleDelete = () => {
    if(!isDesktop){
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
    }
    else{
      const confirmed = window.confirm('Voulez-vous vraiment supprimer cette publication ?');
      if(confirmed){
        try {
          deletePublication(publication.id);
          navigation.goBack();
        } catch (e) {
          console.error(e);
          window.alert('Erreur', "Impossible de supprimer la publication.");
        }
      }
    }
    
  };

  const handleFinish = async () => {
    
      try {
        await updatePublicationState(publication.id, PUB_STATES.FINISHED);
        if(!isDesktop){
          Alert.alert('Publication terminée', 'La publication a été marquée comme terminée.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }
        else{
          window.alert('La publication a été marquée comme terminée.');
          navigation.goBack();
        }
      } catch (e) {
        console.error(e);
        if(!isDesktop){
          Alert.alert('Erreur', "Impossible de marquer la publication comme terminée.");
        }
        else{
          window.alert('Impossible de marquer la publication comme terminée.');
        }
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
      <View style={isDesktop && styles.authorHeader}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            publication?.idUser &&
            navigation.navigate("PublicProfile", { userId: publication.idUser })
          }
          style={[styles.authorCard, styles.half]}
        >
          {authorAvatarUri ? (
            <Image source={{ uri: authorAvatarUri }} style={styles.authorAvatarImg} />
          ) : (
            <DefaultAvatar avatarKey={author?.avatarKey} size={46} />
          )}

          <View style={styles.authorInfo}>
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName || "Utilisateur"}
            </Text>
            {publication?.authorCity ? (
              <Text style={styles.authorCity} numberOfLines={1}>
                {publication.authorCity}
              </Text>
            ) : null}
          </View>
          
         </TouchableOpacity>
         {isDesktop &&  isOwner &&
                 <View style={[styles.ownerRow, styles.half]}>
                   <TouchableOpacity style={[styles.ownerButton, styles.deleteButton]} onPress={handleDelete} activeOpacity={0.8}>
                     <Text style={styles.ownerButtonText}>Supprimer</Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                     style={[styles.ownerButton, isFinished ? styles.finishDisabled : styles.finishButton]}
                     onPress={isFinished ? null : handleFinish}
                     activeOpacity={0.8}
                     disabled={isFinished}
                   >
                     <Text style={styles.ownerButtonText}>{isFinished ? 'Terminé' : 'Terminer'}</Text>
                   </TouchableOpacity>
                 </View>
          }
          {isDesktop &&  !isOwner &&
         <TouchableOpacity 
                style={[styles.actionButton, isFinished && styles.actionDisabled, styles.half]} 
                onPress={isFinished ? null : handleActionPress}
                activeOpacity={0.8}
                disabled={isFinished}
            >
              <Text style={styles.actionButtonText}>
                {isFinished ? "Publication terminée" : "Contacter"}
              </Text>
          </TouchableOpacity>
          }
        </View>

        <View style={isDesktop && width>750 && styles.rowContainer}>
          <DetailHero imageUri={publication.image} style={styles.half}/>
          
          <DetailBody 
            title={publication.title}
            category={publication.categoryTitle}
            date={displayDate}
            description={publication.description}
            city={publication.authorCity}
            authorName=""
            style={styles.half}
          />
        </View>
      </ScrollView>

      {/* 3. Action Fixe */}
      {!isDesktop &&
        <DetailFooter 
          isHelpRequest={publication.isHelpRequest} 
          onPress={handleActionPress}
          isOwner={isOwner}
          onDelete={handleDelete}
          onFinish={handleFinish}
          state={publication.state}
        />
      }
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
  authorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",

    // ✅ au-dessus de l'image (pas superposé)
    marginTop: 14,
    marginHorizontal: 14,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  authorInfo: {
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  authorCity: {
    marginTop: 2,
    fontSize: 12,
    color: "#555",
  },
  rowContainer: {
    flexDirection: "row",
  },
  half: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: "#29AAAB",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 14,
    marginBottom: 10,
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
  ownerRow: { flexDirection: 'row', gap: 0 },
  ownerButton: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: "center", margin: 14, marginBottom: 10,},
  deleteButton: { backgroundColor: '#e74c3c' },
  finishButton: { backgroundColor: '#27ae60' },
  finishDisabled: { backgroundColor: '#95a5a6' },
  ownerButtonText: { color: 'white', fontWeight: '700' },
});