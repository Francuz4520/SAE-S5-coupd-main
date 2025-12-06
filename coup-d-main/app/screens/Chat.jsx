import { View, Text, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getConversationDocument, getConversationDocumentByParticipants, getUserDocument, listenMessagesForConversation } from "../api/firestoreService";
import { getAuth } from "firebase/auth";

export default function ChatScreen({navigation, route}) {
    const { interlocutors = null, conversationID = null } = route.params || {};
    const [newChat, setNewChat] = useState(conversationID ? false : true);
    const [conversationId, setConversationId] = useState(conversationID || null);
    console.log("ChatScreen:", "newChat:", newChat);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [chatMembers, setChatMembers] = useState([]);

    useEffect(() => {
        async function loadUsers() {
            try {
                const user = JSON.parse(await AsyncStorage.getItem("user")) || getAuth().currentUser;
                setCurrentUser(await getUserDocument(user.uid));
                const interlocutorsData = await Promise.all(
                    (interlocutors || []).map(async (element) => {
                        const memberData = await getUserDocument(element);
                        if (!memberData) console.log("Utilisateur non trouvé :", element);
                        return memberData;
                    })
                );

                const membersList = [...interlocutorsData.filter(Boolean)];
                setChatMembers(membersList);

            } catch (error) {
                console.error("Erreur loadUsers:", error);
            }
        }

        loadUsers();
    }, []);

    useEffect(() => {
        async function loadConversation() {
            let conversation = null;

            if (conversationID) {
                conversation = await getConversationDocument(conversationID);
            } else if (interlocutors && interlocutors.length > 0) {
                if (!currentUser) return;
                const participantIds = [currentUser.uid, ...interlocutors].filter(Boolean);
                conversation = await getConversationDocumentByParticipants(participantIds);
            }

            if (conversation) {
                setConversationId(conversation.id);
                console.log("Conversation trouvée :", conversation.id);
                setNewChat(false);
            }
        }

        loadConversation();
    }, [currentUser, conversationID, interlocutors]);

    useEffect(() => {
        if (newChat) return;

        const unsubscribe = listenMessagesForConversation(conversationId, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [newChat]);


    const chatMembersFirstname = chatMembers.map(m => m.firstname).join(", ");

    if (chatMembersFirstname) {
        return (
            <View style={styles.container}>
                <Banner text={`Conversation avec ${chatMembersFirstname}`} onBack={() => navigation.navigate("Home", {screen: "Messages"})} />
                {newChat ? (
                    <Text>Commencer la conversation avec {chatMembersFirstname}</Text>
                ) : (
                    <View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});