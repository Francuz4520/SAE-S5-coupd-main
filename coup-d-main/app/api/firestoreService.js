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

        const q = query(ref, where("participants", "array-contains", participantIds[0]));

        const snap = await getDocs(q);

        const allMatches = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

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
        const convRef = await addDoc(collection(db, "conversations"), {
            participants: participantsID,
            lastMessage: null,
            updatedAt: serverTimestamp(),
        });

        const conversationId = convRef.id;

        const msgRef = await addDoc(
            collection(db, "conversations", conversationId, "messages"),
            {
                senderId,
                text: firstMessageText,
                type: "text",
                createdAt: serverTimestamp(),
            }
        );

        await setDoc(
            doc(db, "conversations", conversationId),
            { lastMessage: firstMessageText },
            { merge: true }
        );
    } catch (error) {
        console.error("Erreur createConversation:", error);
        throw error;
    }
}

export async function sendMessageToConversation(conversationId, senderId, text, type = "text") {
    try {
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
        });

    } catch (error) {
        console.error("Erreur sendMessageToConversation:", error);
        throw error;
    }
}

export function listenUserConversations(userId, callback) {
    try {
        const conversationsRef = collection(db, "conversations");

        const q = query(
            conversationsRef,
            where("participants", "array-contains", userId),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const conversations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            callback(conversations);
        });

        return unsubscribe;

    } catch (error) {
        console.error("Erreur listenUserConversations:", error);
        throw error;
    }
}