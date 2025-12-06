import { db } from "./Firestore";
import { getDoc , getDocs , doc, updateDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";


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

export async function getConversationDocument(conversationId) {
    try {
        const ref = doc(db, "conversations", conversationId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("Erreur getConversationDocument:", error);
        throw error;
    }
}

export async function getConversationDocumentByParticipants(participantIds) {
    try {
        const ref = collection(db, "conversations");

        let q = ref;

        participantIds.forEach(uid => {
            q = query(q, where("participants", "array-contains", uid));
        });

        const snap = await getDocs(q);

        const allMatches = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const match = allMatches.find(conv =>
            conv.participants.length === participantIds.length &&
            participantIds.every(uid => conv.participants.includes(uid))
        );
        console.log("getConversationByParticipants - match:", match);
        return match || null;

    } catch (error) {
        console.error("Erreur getConversationByParticipants:", error);
        throw error;
    }
}

export function listenMessagesForConversation(conversationId, callback) {
    if (!conversationId) return () => {};

    const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));
        callback(messages);
    });

    return unsubscribe;
}