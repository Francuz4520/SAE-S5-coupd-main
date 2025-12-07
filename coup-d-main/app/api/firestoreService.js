import { db } from "./Firestore";
import { getDoc , doc, updateDoc, deleteDoc } from "firebase/firestore";



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

export async function deletePublication(pubId) {
    try {
        const ref = doc(db, "publications", pubId);
        await deleteDoc(ref);
        return true;
    } catch (error) {
        console.error("Erreur deletePublication:", error);
        throw error;
    }
}

export async function setPublicationFinished(pubId, finished = true) {
    try {
        const ref = doc(db, "publications", pubId);
        await updateDoc(ref, { isFinished: finished });
        return true;
    } catch (error) {
        console.error("Erreur setPublicationFinished:", error);
        throw error;
    }
}
