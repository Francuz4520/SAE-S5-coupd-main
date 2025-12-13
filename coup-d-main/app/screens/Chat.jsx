import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, TouchableOpacity, Platform, FlatList  } from "react-native";
import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getConversationDocument, getConversationDocumentByParticipants, getUserDocument, listenMessagesForConversation, createConversationDocument, sendMessageToConversation } from "../api/firestoreService";
import { getAuth } from "firebase/auth";

export default function ChatScreen({navigation, route}) {
    
    const { interlocutors = null, conversationID = null } = route.params || {};
    const [newChat, setNewChat] = useState(conversationID ? false : true);
    const [conversationId, setConversationId] = useState(conversationID || null);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [chatMembers, setChatMembers] = useState([]);
    let flatListRef;

    useEffect(() => {
        async function loadUsers() {
            try {
                const user = JSON.parse(await AsyncStorage.getItem("user")) || getAuth().currentUser;
                if (!user) {
                    console.error("Impossible de récupérer l'utilisateur.");
                    return;
                }
                setCurrentUserID(user.uid);
                const interlocutorsData = await Promise.all(
                    (interlocutors || []).map(getUserDocument)
                );

                setChatMembers(interlocutorsData.filter(Boolean));

            } catch (error) {
                console.error("Erreur loadUsers:", error);
            }
        }

        loadUsers();
    }, []);

    useEffect(() => {
        if (!currentUserID) return;
        async function loadConversation() {
            try {
                let conversation = null;
                if (conversationID) {
                    conversation = await getConversationDocument(conversationID);
                    if (conversation?.participants) {
                        const otherUserIds = conversation.participants.filter(
                            uid => uid !== currentUserID
                        );

                        const users = await Promise.all(
                            otherUserIds.map(getUserDocument)
                        );

                        setChatMembers(users.filter(Boolean));
                    }
                }
                else if (interlocutors && interlocutors.length > 0) {
                    const participantIds = [currentUserID, ...interlocutors];
                    conversation = await getConversationDocumentByParticipants(participantIds);
                }
                if (conversation) {
                    setConversationId(conversation.id);
                    setNewChat(false);
                }
            } catch (error) {
                console.error("Erreur loadConversation:", error);
            }
        }

        loadConversation();
    }, [currentUserID, conversationID, newChat]);

    useEffect(() => {
        if (newChat) return;
        if (!conversationId) return;

        const unsubscribe = listenMessagesForConversation(conversationId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [conversationId, newChat]);

    const chatMembersFullname = chatMembers.map(m => `${m.firstname} ${m.lastname}`).join(", ");

    const MessageInput = () => {
        const [text, setText] = useState("");
        const handleSend = () => {
            if (text.trim().length === 0) return;
            if (newChat && currentUserID && chatMembers.length > 0) {
                const participants = [currentUserID, ...chatMembers.map(m => m.id)];
                const senderId = currentUserID;
                if (createConversationDocument(participants, senderId, text)) {
                    console.log("Creating convo with", participants, senderId, text);
                    console.log("Conversation créée avec succès");
                    const conversation = getConversationDocumentByParticipants(participants);
                    setConversationId(conversation.id);
                    setNewChat(false);
                } else {
                    console.error("Échec de la création de la conversation");
                }
            }
            else if (conversationId) {
                console.log("Envoi du message dans la conversation existante:", conversationId, text);
                sendMessageToConversation(conversationId, currentUserID, text);
            }
            else console.error("Impossible d'envoyer le message : données manquantes pour une nouvelle conversation");
            setText("");
        };

        return (
            <View style={styles.inputContainer}>
                <View style={styles.innerContainer}>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder="Écrire un message..."
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.button}>
                        <Text style={styles.buttonText}>Envoyer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const MessageBubble = ({ message, currentUserMessage }) => {
        return (
            <View style={[styles.messageBubble, currentUserMessage ? styles.currentUserMessage : styles.otherMessage]}>
                <Text style={styles.messageText}>{message.text}</Text>
            </View>
        );
    }

    if (chatMembersFullname) {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.container}>
                    <Banner text={`Conversation avec ${chatMembersFullname}`} onBack={() => navigation.navigate("Home", {screen: "Messages"})} />
                    {newChat ? (
                        <View style={styles.newConversationContainer}>
                            <Text>Commencer la conversation avec {chatMembersFullname}</Text>
                            <MessageInput />
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={messages}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <MessageBubble 
                                        message={item} 
                                        currentUserMessage={item.senderId === currentUserID} 
                                    />
                                )}
                                contentContainerStyle={styles.messagesContainer}
                                ref={(ref) => { flatListRef = ref }}
                                onContentSizeChange={() => flatListRef?.scrollToEnd({ animated: true })}
                                onLayout={() => flatListRef?.scrollToEnd({ animated: true })}
                            />
                            <MessageInput />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: "#fff",
    },
    newConversationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    inputContainer: {
        flex: 1,
        position: "absolute",
        bottom: 20,
        width: "100%",
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    innerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#f2f2f2",
        borderRadius: 20,
    },
    button: {
        marginLeft: 10,
        backgroundColor: "#007bff",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    messagesContainer: {
        padding: 10,
    },
    messageBubble: {
        maxWidth: "75%",
        padding: 10,
        marginVertical: 6,
        borderRadius: 12,
    },
    currentUserMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#ddd",
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#a8e6a1",
    },
    messageText: {
        fontSize: 15,
    },
});