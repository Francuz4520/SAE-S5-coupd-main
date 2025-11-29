import { db } from "./Firestore";
import { getDoc , doc, updateDoc } from "firebase/firestore";



export async function getUserDocument(uid) {
    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        return snap.exists() ? { id: snap.id, ...snap.data()

        } : null;

    } catch (error) {
        console.error("Erreur getUserDocument:", error);
        throw error;
    }
}

export async function updateUserDocument(uid, fields) {
    try {
        const ref = doc(db, "users", uid);
        await updateDoc(ref, fields);
        return true;
    } catch (error) {
        console.error("Erreur updateUserDocument:", error);
        throw error;
    }
}
