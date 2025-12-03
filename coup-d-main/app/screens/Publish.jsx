import { Text, View, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { useState} from "react"
import { usePublications } from "../hooks/usePublications";
import * as ImagePicker from "expo-image-picker";
import { uploadToImgBB } from "../utils/imgbbService"; // Import de notre service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PublishScreen(){
  const [type, setType] = useState("request")
  const { categoriesList } = usePublications(); 
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  function validate() {
    const newErrors = {}

    if (!categoryId){
      newErrors.categoryId ="Veuillez choisir une catégorie.";
    }

    if (!title.trim()){
      newErrors.title ="Le titre est obligatoire.";
    }

    if (!description.trim()){
      newErrors.description ="La description est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length ===0;
  }

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "L'application a besoin d'accéder à vos photos pour ajouter une image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };


  async function handlePublish() {
    if (!validate()) return;

    const user = JSON.parse(await AsyncStorage.getItem("user")) || getAuth().currentUser;

    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour publier.");
      return;
    }

    setIsLoading(true);

    try {
      const db = getFirestore();

      let imageUrl = null;
      if (imageUri){
        const publicUrl = await uploadToImgBB(imageUri);
        if(!publicUrl){
          Alert.alert("Erreur", "L'upload de l'image a échoué");
          setIsLoading(false);
          return;
        }
        imageUrl = publicUrl;
      }

      const publication = {
        title: title.trim(),
        description: description.trim(),
        date: serverTimestamp(),
        isHelpRequest: type === "request",
        isFinished: false,
	      image: imageUrl,
        idCategory: categoryId,
        idUser: user.uid,
      };

      await addDoc(collection(db, "publications"), publication);

      Alert.alert("Publié ", "Votre annonce a bien été créée.");

      // 5. Reset du formulaire
      setCategoryId(null);
      setTitle("");
      setDescription("");
      setType("request");
      setImageUri(null);
      setErrors({});
    } catch (error) {
      console.log("Erreur lors de la publication :", error);
      Alert.alert(
        "Erreur",
        "Impossible de publier pour le moment. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  }

return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Bandeau titre */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publier</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                type === "request" && styles.typeButtonActive,
              ]}
              onPress={() => setType("request")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === "request" && styles.typeButtonTextActive,
                ]}
              >
                Demander de l'aide
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeButton,
                type === "offer" && styles.typeButtonActive,
              ]}
              onPress={() => setType("offer")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === "offer" && styles.typeButtonTextActive,
                ]}
              >
                Proposer de l'aide
              </Text>
            </Pressable>
          </View>

          {/* Catégorie */}
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoriesContainer}>
            {categoriesList.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selected && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.categoryId && (
            <Text style={styles.errorText}>{errors.categoryId}</Text>
          )}

          {/* Titre */}
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Porter mes courses"
            value={title}
            onChangeText={setTitle}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Détails, infos utiles…"
            multiline
            value={description}
            onChangeText={setDescription}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}

          {/* Image */}
          <Text style={styles.label}>Photo (facultatif)</Text>
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>
                Appuyer pour choisir une photo
              </Text>
            )}
          </Pressable>

          {/* Bouton Publier */}
          <Pressable style={styles.publishButton} onPress={handlePublish} disabled={isLoading}>
            <Text style={styles.publishButtonText}>
              {isLoading ? "Publication..." : "Publier"}
            </Text>
          </Pressable>  
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );

}

const PRIMARY = "#29AAAB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: PRIMARY,
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontWeight: "500",
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  typeButtonActive: {
    backgroundColor: PRIMARY,
  },
  typeButtonText: {
    color: PRIMARY,
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "white",
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: 13,
    color: PRIMARY,
  },
  categoryChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    borderColor: "#D0D0D0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
    imagePicker: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    backgroundColor: "white",
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#777",
  },
  imagePreview: {
    width: "100%",
    height: "100%", 
    borderRadius: 12,
    resizeMode: "contain",
  },
  publishButton: {
    backgroundColor: PRIMARY,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  publishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});


