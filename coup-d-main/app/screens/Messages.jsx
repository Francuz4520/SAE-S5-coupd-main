import { Text, View, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native";
import { useEffect, useState } from "react";
import { listenUserConversations, getUserDocument } from "../api/firestoreService";
import { getAuth} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MessagesScreen({ navigation }) {

  const [conversations, setConversations] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // { userId: userData }
  const [currentUserId, setCurrentUserId] = useState(null);
  const isDesktop = Platform.OS === 'web';

  useEffect(() => {
    async function fetchConversations() { 
      try {
        const user = JSON.parse(await AsyncStorage.getItem("user")) || getAuth().currentUser;
        if (!user) {
          console.error("Impossible de récupérer l'utilisateur.");
          return;
        }
        setCurrentUserId(user.uid);
        const unsubscribe = listenUserConversations(user.uid, (conv) => {
          const sortedConversations = [...conv].sort((a, b) => {
            const aTime = a.updatedAt?.toMillis?.() ?? 0;
            const bTime = b.updatedAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          });
          setConversations(sortedConversations);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Erreur fetchConversations:", error);
      } 
    }

    fetchConversations();
  }, []);

  useEffect(() => {
    async function loadUsersForConversations() {
      const ids = new Set();
      conversations.forEach(conv => {
        conv.participants?.forEach(uid => ids.add(uid));
      });
      const missingIds = [...ids].filter(id => !usersMap[id]);
      if (missingIds.length === 0) return;
      const fetchedUsers = await Promise.all(
        missingIds.map(async (uid) => {
          const user = await getUserDocument(uid);
          return user ? [uid, user] : null;
        })
      );
      const newMap = { ...usersMap };
      fetchedUsers.forEach(entry => {
        if (entry) {
          const [uid, user] = entry;
          newMap[uid] = user;
        }
      });
      setUsersMap(newMap);
    }

    loadUsersForConversations();
  }, [conversations]);

  const renderConversation = ({ item }) => {
    if (!currentUserId) return null;

    const otherParticipantsIds = item.participants?.filter(
      uid => uid !== currentUserId
    ) || [];

    const displayName = otherParticipantsIds
      .map(uid => {
        const user = usersMap[uid];
        return user ? `${user.firstname} ${user.lastname}` : "";
      })
      .join(", ");

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate("Chat", {
            conversationID: item.id,
            interlocutors: otherParticipantsIds,
          })
        }
      >
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage || "Aucun message"}
          </Text>
        </View>
        
        {item.updatedAt && (
          <Text style={styles.time}>
            {item.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}{" "}
            {item.updatedAt.toDate().toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!isDesktop &&
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>}
      {usersMap && conversations ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      ) : (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Text style={styles.emptyText}>Chargement des conversations...</Text>
        </View>
      )}
      </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#29AAAB",
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  conversationItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderColor: "#eee",
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  preview: {
    fontSize: 14,
    color: "#888",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});