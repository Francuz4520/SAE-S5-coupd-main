const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

export const uploadToImgBB = async (imageUri) => {
  try {
    if (!IMGBB_API_KEY) {
      throw new Error("La clé API ImgBB est manquante dans la configuration.");
    }

    const formData = new FormData();

    formData.append("image", {
      uri: imageUri,
      name: "photo_upload.jpg",
      type: "image/jpeg",
    });

    // Envoi de la requête
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

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