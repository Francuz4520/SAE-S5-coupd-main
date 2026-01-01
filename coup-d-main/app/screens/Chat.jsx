import { View, Image, Text, StyleSheet, KeyboardAvoidingView, TextInput, TouchableOpacity, Platform, FlatList  } from "react-native";
import { useEffect, useState, useRef } from "react";
import Banner from "../components/Banner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getConversationDocument, getConversationDocumentByParticipants, getUserDocument, listenMessagesForConversation, createConversationDocument, sendMessageToConversation, updatePublicationState, listenPublication } from "../api/firestoreService";
import { getAuth } from "firebase/auth";
import { PUB_LABELS, PUB_STATES } from "../constants/states";

export default function ChatScreen({navigation, route}) {
    
    const { interlocutors = null, conversationID = null, publicationID = null} = route.params || {};
    const [newChat, setNewChat] = useState(conversationID ? false : true);
    const [conversationId, setConversationId] = useState(conversationID || null);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [chatMembers, setChatMembers] = useState([]);
    const [publication, setPublication] = useState(null);
    const [activePubId, setActivePubId] = useState(publicationID || null);
    const [inputText, setInputText] = useState("");

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

    // Chargement des infos de la publication si un ID est fourni
    useEffect(() => {
        if (!activePubId) return;

        const unsubscribe = listenPublication(activePubId, (pubData) => {
            console.log("Mise à jour de la publication reçue :", pubData?.state);
            setPublication(pubData);
        });

        return () => unsubscribe();
    }, [activePubId]);

    useEffect(() => {
        if (!currentUserID) return;
        async function loadConversation() {
            try {
                let conversation = null;
                if (conversationID) {
                    conversation = await getConversationDocument(conversationID);
                    
                    // Si on trouve une conversation et qu'elle est liée à une pub, on met à jour activePubId pour déclencher le listener
                    if (!activePubId && conversation?.publicationId) {
                        setActivePubId(conversation.publicationId);
                    }

                    if (conversation?.participants) {
                        const otherUserIds = conversation.participants.filter(uid => uid !== currentUserID);
                        const users = await Promise.all(otherUserIds.map(getUserDocument));
                        setChatMembers(users.filter(Boolean));
                    }
                } else if (interlocutors && interlocutors.length > 0) {
                    const participantIds = [currentUserID, ...interlocutors];
                    conversation = await getConversationDocumentByParticipants(participantIds);
                }
                
                if (conversation) {
                    setConversationId(conversation.id);
                    setNewChat(false);
                    // Si la conv a une pub mais qu'on ne l'avait pas encore set
                    if (conversation.publicationId && !activePubId) {
                         setActivePubId(conversation.publicationId);
                    }
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

    // Gestion du changement d'état
    const handleStateChange = async (nextState) => {
        if (!publication) return;

        // On met juste à jour Firestore
        // Le listener recevra le changement et mettra à jour l'UI automatiquement
        const success = await updatePublicationState(publication.id, nextState);
        
        if (success) {
            let systemMsg = "";
            switch (nextState) {
                case PUB_STATES.WAITING_FOR_ACCEPTANCE:
                    systemMsg = "📢 L'auteur souhaite valider l'échange avec vous.";
                    break;
                case PUB_STATES.IN_PROGRESS:
                    systemMsg = "🤝 Accord confirmé ! L'échange/mission commence maintenant.";
                    break;
                case PUB_STATES.WAITING_FOR_VALIDATION:
                    systemMsg = "🏁 L'interlocuteur indique que tout est terminé. En attente de validation finale.";
                    break;
                case PUB_STATES.DISPUTE:
                    systemMsg = "⚠️ ALERTE : Un problème a été signalé par l'auteur sur le déroulement de l'échange.";
                    break;
                case PUB_STATES.FINISHED:
                    if (publication.state === PUB_STATES.DISPUTE) {
                        systemMsg = "✅ Le litige est marqué comme résolu. L'échange est clôturé.";
                    } else {
                        systemMsg = "✅ L'échange est validé et terminé avec succès.";
                    }
                    break;
                default:
                    systemMsg = `📢 Nouveau statut : ${PUB_LABELS[nextState]}`;
            }
            sendMessageToConversation(conversationId, currentUserID, systemMsg, "system");
        }
    };

    const chatMembersFullname = chatMembers.map(m => `${m.firstname} ${m.lastname}`).join(", ");

    const handleSend = () => {
        if (inputText.trim().length === 0) return;

        if (newChat && currentUserID && chatMembers.length > 0) {
            const participants = [currentUserID, ...chatMembers.map(m => m.id)];
            createConversationDocument(participants, currentUserID, inputText, publicationID).then(() => {
                 getConversationDocumentByParticipants(participants).then(conv => {
                    if(conv) {
                        setConversationId(conv.id);
                        setNewChat(false);
                        setActivePubId(conv.publicationId);
                    }
                 });
            });
        }
        else if (conversationId) {
            sendMessageToConversation(conversationId, currentUserID, inputText);
        }
        
        setInputText("");
    };

    const MessageBubble = ({ message, currentUserMessage }) => {
    
    // Si c'est un message système, on retourne un affichage centré et discret
    if (message.type === "system") {
        return (
            <View style={styles.systemMessageContainer}>
                <Text style={styles.systemMessageText}>{message.text}</Text>
            </View>
        );
    }

    // Sinon, c'est un message utilisateur classique
    return (
        <View style={[
            styles.messageBubble, 
            currentUserMessage ? styles.currentUserMessage : styles.otherMessage
        ]}>
            <Text style={styles.messageText}>{message.text}</Text>
        </View>
    );
}

    // Composant pour le bouton d'action de la publication
    const PublicationActionHeader = () => {
        if (!publication) return null;

        const isOwner = currentUserID === publication.idUser;
        const state = publication.state;

        const isDispute = state === PUB_STATES.DISPUTE;

        return (
            <View style={styles.pubCard}>
                <View style={styles.pubInfo}>
                    {publication.image && <Image source={{ uri: publication.image }} style={styles.pubImage} />}
                    <View style={styles.pubTextContainer}>
                        <Text style={styles.pubTitle}>{publication.title}</Text>
                        <Text style={styles.pubState}>
                            Statut : {PUB_LABELS[state] || state}
                        </Text>
                    </View>
                </View>

                {/* LOGIQUE DES BOUTONS SELON LE SCÉNARIO */}

                {/* 1. INITIALISATION : L'auteur choisit cet interlocuteur */}
                {state === PUB_STATES.OPEN && isOwner && (
                    <TouchableOpacity onPress={() => handleStateChange(PUB_STATES.WAITING_FOR_ACCEPTANCE)} style={styles.actionButton}>
                        <Text style={styles.buttonTextSmall}>Choisir cet utilisateur</Text>
                    </TouchableOpacity>
                )}

                {/* 2. ACCORD : L'interlocuteur accepte la mission/le prêt */}
                {state === PUB_STATES.WAITING_FOR_ACCEPTANCE && !isOwner && (
                    <TouchableOpacity onPress={() => handleStateChange(PUB_STATES.IN_PROGRESS)} style={[styles.actionButton, styles.greenBtn]}>
                        <Text style={styles.buttonTextSmall}>Accepter & Commencer</Text>
                    </TouchableOpacity>
                )}
                
                {/* INFO : En attente de l'acceptation */}
                {state === PUB_STATES.WAITING_FOR_ACCEPTANCE && isOwner && (
                     <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>En attente de réponse...</Text>
                     </View>
                )}

                {/* 3. RÉALISATION : L'interlocuteur dit qu'il a fini (rendu l'objet OU fini le service) */}
                {state === PUB_STATES.IN_PROGRESS && !isOwner && (
                    <TouchableOpacity onPress={() => handleStateChange(PUB_STATES.WAITING_FOR_VALIDATION)} style={[styles.actionButton, styles.blueBtn]}>
                        <Text style={styles.buttonTextSmall}>J'ai terminé</Text>
                    </TouchableOpacity>
                )}

                {/* 4. VALIDATION / SIGNALEMENT : L'auteur vérifie */}
                {state === PUB_STATES.WAITING_FOR_VALIDATION && isOwner && (
                    <View style={styles.actionRow}>
                        {/* Bouton Signaler (Problème / Non rendu / Mal fait) */}
                        <TouchableOpacity 
                            onPress={() => handleStateChange(PUB_STATES.DISPUTE)} 
                            style={[styles.actionButton, styles.redBtn, { marginRight: 5 }]}
                        >
                            <Text style={styles.buttonTextSmall}>⚠️ Signaler</Text>
                        </TouchableOpacity>

                        {/* Bouton Valider */}
                        <TouchableOpacity 
                            onPress={() => handleStateChange(PUB_STATES.FINISHED)} 
                            style={[styles.actionButton, styles.greenBtn]}
                        >
                            <Text style={styles.buttonTextSmall}>Valider la fin</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* INFO : En attente de validation */}
                {state === PUB_STATES.WAITING_FOR_VALIDATION && !isOwner && (
                     <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Validation demandée...</Text>
                     </View>
                )}
                
                {/* 5. GESTION DU LITIGE (L'auteur résout le problème) */}
                {state === PUB_STATES.DISPUTE && isOwner && (
                    <TouchableOpacity 
                        onPress={() => handleStateChange(PUB_STATES.FINISHED)} 
                        style={[styles.actionButton, styles.greenBtn]}
                    >
                        <Text style={styles.buttonTextSmall}>Litige résolu / Terminer</Text>
                    </TouchableOpacity>
                )}

                {/* INFO : Mode Litige pour l'interlocuteur */}
                {state === PUB_STATES.DISPUTE && !isOwner && (
                     <View style={[styles.statusBadge, styles.badgeDispute]}>
                        <Text style={[styles.statusText, styles.textDispute]}>Action requise !</Text>
                     </View>
                )}
            </View>
        );
    };

    if (chatMembersFullname || newChat) {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.container}>
                    <Banner text={chatMembersFullname ? `Conversation avec ${chatMembersFullname}` : "Chargement..."} onBack={() => navigation.navigate("Home", {screen: "Messages"})} />
                    
                    <PublicationActionHeader />

                    <View style={{ flex: 1 }}>
                        {newChat ? (
                            // Si c'est un nouveau chat, on affiche juste un texte au milieu
                            <View style={styles.newConversationContainer}>
                                <Text>Commencer la conversation avec {chatMembersFullname}</Text>
                            </View>
                        ) : (
                            // Sinon on affiche la liste
                            <FlatList
                                data={messages}
                                keyExtractor={(item) => item.id}
                                inverted={true}
                                // Empêche la liste de fermer le clavier quand on clique dessus ou sur le bouton
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <MessageBubble
                                        message={item}
                                        currentUserMessage={item.senderId === currentUserID}
                                    />
                                )}
                                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                            />
                        )}
                    </View>

                    {/* L'INPUT EST MAINTENANT TOUJOURS LÀ*/}
                    <View style={styles.inputContainer}>
                        <View style={styles.innerContainer}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Écrire un message..."
                            />
                            <TouchableOpacity onPress={handleSend} style={styles.button}>
                                <Text style={styles.buttonText}>Envoyer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </KeyboardAvoidingView>
        );
    }
    return <View style={styles.container}><Text>Chargement...</Text></View>;
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: "#fff",
    },
    
    // Styles pour le bandeau de publication
     pubCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 10,
        margin: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#efefef'
    },
    pubInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    pubImage: { width: 45, height: 45, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
    pubTextContainer: { flex: 1 },
    pubTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    pubState: { fontSize: 12, color: '#777', marginTop: 2 },
    actionButton: {
        backgroundColor: "#FF9800",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    greenBtn: { backgroundColor: '#28a745' },
    blueBtn: { backgroundColor: '#007bff' },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    redBtn: {
        backgroundColor: '#dc3545',
    },
    buttonTextSmall: { color: "#fff", fontSize: 12, fontWeight: "bold" },
    
    statusBadge: {
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    statusText: { fontSize: 10, color: '#555', fontStyle: 'italic'},

    // Styles spécifiques au mode LITIGE
    pubCardDispute: {
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5', // Fond légèrement rouge
        borderWidth: 2,
    },
    textDispute: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    badgeDispute: {
        backgroundColor: '#ffdbe0',
    },

    // Styles pour la conversation
    newConversationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    inputContainer: {
        width: "100%",
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",

        paddingBottom: 20,
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
        paddingBottom: 20
    },
    systemMessageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        paddingHorizontal: 20,
    },
    systemMessageText: {
        color: '#888', 
        fontSize: 12,  
        fontStyle: 'italic',
        textAlign: 'center',
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