import { db } from "./Firestore";
import { getDoc , doc } from "firebase/firestore";



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
