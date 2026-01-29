import { db } from "./Firestore";
import { getDoc, getDocs, doc, updateDoc, collection, query, where, onSnapshot, orderBy, setDoc, addDoc, serverTimestamp, deleteDoc, writeBatch, increment } from "firebase/firestore";

// --- USERS ---

export async function getUserDocument(uid) {
    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        return snap.exists() ? { id: snap.id, ...snap.data() } : null;

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


// --- REVIEWS / REPUTATION ---

function getReviewDocId(publicationId, fromUserId, toUserId) {
    return `${publicationId}_${fromUserId}_${toUserId}`;
}

export async function getReviewForPublication(publicationId, fromUserId, toUserId) {
    try {
        const reviewId = getReviewDocId(publicationId, fromUserId, toUserId);
        const ref = doc(db, "reviews", reviewId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("Erreur getReviewForPublication:", error);
        throw error;
    }
}

export async function createReview({ publicationId, fromUserId, toUserId, ratings, comment = "" }) {
    try {
        const reviewId = getReviewDocId(publicationId, fromUserId, toUserId);
        const reviewRef = doc(db, "reviews", reviewId);

        const existing = await getDoc(reviewRef);
        if (existing.exists()) {
            const err = new Error("Review already exists");
            err.code = "review/already-exists";
            throw err;
        }

        const reliability = Number(ratings?.reliability ?? 0);
        const quality = Number(ratings?.quality ?? 0);
        const attitude = Number(ratings?.attitude ?? 0);
        const communication = Number(ratings?.communication ?? 0);
        const overall = (reliability + quality + attitude + communication) / 4;

        const batch = writeBatch(db);
        batch.set(reviewRef, {
            publicationId,
            fromUserId,
            toUserId,
            ratings: {
                reliability,
                quality,
                attitude,
                communication,
                overall,
            },
            comment: comment?.trim?.() ? comment.trim() : "",
            createdAt: serverTimestamp(),
        });

        const userRef = doc(db, "users", toUserId);
        batch.update(userRef, {
            "reputation.count": increment(1),
            "reputation.sumReliability": increment(reliability),
            "reputation.sumQuality": increment(quality),
            "reputation.sumAttitude": increment(attitude),
            "reputation.sumCommunication": increment(communication),
            "reputation.sumOverall": increment(overall),
        });

        await batch.commit();
        return { id: reviewId };
    } catch (error) {
        console.error("Erreur createReview:", error);
        throw error;
    }
}


// --- PUBLICATIONS ---

export async function getPublicationDocument(pubId) {
    try {
        const ref = doc(db, "publications", pubId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("Erreur getPublicationDocument:", error);
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

export async function updatePublicationState(pubId, newState) {
    try {
        const ref = doc(db, "publications", pubId);
        await updateDoc(ref, { state: newState }); 
        return true;
    } catch (error) {
        console.error("Erreur updatePublicationState:", error);
        throw error;
    }
}

export function listenPublication(pubId, callback) {
    if (!pubId) return () => {};

    const ref = doc(db, "publications", pubId);

    const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() });
        } else {
            callback(null);
        }
    });

    return unsubscribe;
}


// --- CONVERSATIONS ---

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

export async function getConversationDocumentByParticipants(participantIds, publicationId = null) {
    try {
        const ref = collection(db, "conversations");

        const q = query(ref, where("participants", "array-contains", participantIds[0]));

        const snap = await getDocs(q);

        const allMatches = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const match = allMatches.find(conv => {
            const hasSameParticipants = 
                conv.participants.length === participantIds.length &&
                participantIds.every(uid => conv.participants.includes(uid));

            if (publicationId) {
                return hasSameParticipants && conv.publicationId === publicationId;
            }

            return hasSameParticipants;
        });

        console.log("match trouvé :", match ? match.id : "aucun");
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
        orderBy("createdAt", "desc")
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

export async function createConversationDocument(participantsID, senderId, firstMessageText, publicationId = null) {
    try {
        const convRef = await addDoc(collection(db, "conversations"), {
            participants: participantsID,
            lastMessage: null,
            updatedAt: serverTimestamp(),
            publicationId: publicationId,
        });

        const conversationId = convRef.id;

        await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderId,
            text: firstMessageText,
            type: "text",
            createdAt: serverTimestamp(),
        });

        await setDoc(
            doc(db, "conversations", conversationId),
            { 
                lastMessage: firstMessageText,
                lastMessageSenderId: senderId,
                updatedAt: serverTimestamp(),
             },
            { merge: true }
        );
        return { id: conversationId, publicationId };
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
            lastMessageSenderId: senderId,
            updatedAt: serverTimestamp(),
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