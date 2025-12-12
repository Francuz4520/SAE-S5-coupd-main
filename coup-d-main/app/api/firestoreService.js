import { db } from "./Firestore";
import { getDoc , getDocs , doc, updateDoc, collection, query, where, onSnapshot, orderBy, setDoc, addDoc, serverTimestamp } from "firebase/firestore";


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

        // 1 seul array-contains autorisé
        const q = query(ref, where("participants", "array-contains", participantIds[0]));

        const snap = await getDocs(q);

        const allMatches = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Filtrage manuel côté JS
        const match = allMatches.find(conv =>
            conv.participants.length === participantIds.length &&
            participantIds.every(uid => conv.participants.includes(uid))
        );

        console.log("match:", match);
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

export async function createConversationDocument(participantsID, senderId, firstMessageText) {
    try {
        // 1) Créer une conversation vide (pour générer son ID)
        const convRef = await addDoc(collection(db, "conversations"), {
            participants: participantsID,
            lastMessage: null, // on ajoutera le message juste après
        });

        const conversationId = convRef.id;

        // 2) Ajouter le premier message dans la sous-collection messages/
        const msgRef = await addDoc(
            collection(db, "conversations", conversationId, "messages"),
            {
                senderId,
                text: firstMessageText,
                type: "text",
                createdAt: serverTimestamp(),
            }
        );

        // 3) Mettre à jour lastMessage avec l'ID du message
        await setDoc(
            doc(db, "conversations", conversationId),
            { lastMessage: msgRef.id },
            { merge: true }
        );
    } catch (error) {
        console.error("Erreur createConversation:", error);
        throw error;
    }
}

export async function sendMessageToConversation(conversationId, senderId, text, type = "text") {
    try {
        if (!conversationId || !senderId || !text) throw new Error("Paramètres manquants");

        const messagesRef = collection(db, "conversations", conversationId, "messages");
        const newMessage = {
            senderId,
            text,
            type,
            createdAt: serverTimestamp(),
        };
        const messageDocRef = await addDoc(messagesRef, newMessage);

        const conversationRef = doc(db, "conversations", conversationId);
        await updateDoc(conversationRef, {
            lastMessage: text,
            updatedAt: serverTimestamp(),
        });

    } catch (error) {
        console.error("Erreur sendMessageToConversation:", error);
        throw error;
    }
}