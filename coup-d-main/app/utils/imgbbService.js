const IMGBB_API_KEY = "0028f8969fb0e7dfad414e304f9ceccb";

export const uploadToImgBB = async (imageUri) => {
  try {
    // Création du formulaire
    const formData = new FormData();

    // React Native a besoin de ces 3 champs (uri, name, type) pour comprendre qu'il s'agit d'un fichier.
    formData.append("image", {
      uri: imageUri,
      name: "photo_upload.jpg", // Le nom n'importe peu pour ImgBB
      type: "image/jpeg",
    });

    // Envoi de la requête
    // On passe la clé API en paramètre d'URL pour simplifier
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const result = await response.json();

    // Vérification et retour du lien
    if (result.success) {
      // On renvoie le champ 'url' qui est le lien DIRECT (.jpg)
      return result.data.url;
    } else {
      throw new Error("Échec de l'upload ImgBB");
    }

  } catch (error) {
    console.error("Erreur upload ImgBB:", error);
    return null;
  }
};