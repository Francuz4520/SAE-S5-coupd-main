import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./seed/serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function deleteLastUsers(n = 30) {
  // 1️⃣ Récupérer les 30 derniers documents
  const snapshot = await db.collection("users")
    .orderBy("createdAt", "desc")
    .limit(n)
    .get();

  if (snapshot.empty) {
    console.log("Aucun utilisateur à supprimer !");
    return;
  }

  // 2️⃣ Supprimer chaque user Auth et document Firestore
  for (const doc of snapshot.docs) {
    const uid = doc.id;

    try {
      await auth.deleteUser(uid);
      await doc.ref.delete();
      console.log(`Utilisateur ${uid} supprimé`);
    } catch (err) {
      console.error(`Erreur pour ${uid}:`, err);
    }
  }

  console.log(`Suppression des ${n} derniers utilisateurs terminée`);
}

deleteLastUsers(30)
  .then(() => process.exit(0))
  .catch(console.error);
