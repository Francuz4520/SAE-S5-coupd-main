import { Platform } from "react-native";

const IMGBB_API_KEY = "0028f8969fb0e7dfad414e304f9ceccb";

export const uploadToImgBB = async (imageUri) => {
  try {
    const formData = new FormData();

    if (Platform.OS === "web") {
      // Sur le web : convertir l’URI en Blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      formData.append("image", blob, "photo_upload.jpg");
    } else {
      // Sur mobile : garder l’objet RN
      formData.append("image", {
        uri: imageUri,
        name: "photo_upload.jpg",
        type: "image/jpeg",
      });
    }

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
        // ⚠️ important : ne pas définir Content-Type manuellement
      }
    );

    const result = await response.json();
    console.log("Résultat ImgBB:", result);

    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || "Échec de l'upload ImgBB");
    }
  } catch (error) {
    console.error("Erreur upload ImgBB:", error);
    return null;
  }
};
