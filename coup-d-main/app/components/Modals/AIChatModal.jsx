import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform, Animated } from 'react-native';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={[styles.msgBubble, styles.iaBubble, { flexDirection: 'row', alignItems: 'center', width: 50 }]}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export default function ChatModal({ visible, onClose, setAppliedFilters }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef();

    const handleApplyFilters = (messageId, filters) => {
        setMessages(prev => 
            prev.map(msg => msg.id === messageId ? { ...msg, showChoices: false } : msg)
        );
        if (filters && filters.searchText) {
            console.log("Application des filtres :", filters);
            setAppliedFilters(prev => ({ 
                ...prev, 
                type: filters.type || prev.type,
                text: filters.searchText 
            }));
            onClose();
        } else {
            console.warn("Tentative d'application d'un filtre vide ou malformé.");
        }
    };
    const handleDeclineChoices = (messageId) => {
        setMessages(prev => 
            prev.map(msg => msg.id === messageId ? { ...msg, showChoices: false } : msg)
        );
    };

    const sendMessage = async () => {
        if (inputText.trim() === '' || isTyping) return;

        const userMsg = { id: Date.now().toString(), text: inputText, fromUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch('http://192.168.1.11:5678/webhook-test/ia-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputText }),
            });

            const processAIResponse = (rawData) => {
                const parts = rawData.split('|||');
                let textPart = parts[0] || "";
                let jsonPart = parts[1] ? parts[1].trim() : null;
                if (jsonPart) {
                    try {
                        const firstBrace = jsonPart.indexOf('{');
                        const lastBrace = jsonPart.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace !== -1) {
                            jsonPart = jsonPart.substring(firstBrace, lastBrace + 1);
                        }
                        const filters = JSON.parse(jsonPart);
                        return { message: textPart.replace(/\*\*/g, '').trim(), filters };
                    } catch (e) {
                        console.error("Erreur JSON :", e);
                    }
                }
                return { message: textPart.replace(/\*\*/g, '').trim(), filters: null };
            };

            const data = processAIResponse(await response.text());
            
            const iaMsg = { 
                id: (Date.now() + 1).toString(), 
                text: data.message, 
                fromUser: false,
                filters: data.filters, 
                showChoices: !!(data.filters && data.filters.searchText)
            };

            setMessages(prev => [...prev, iaMsg]);
        } catch (e) {
            setMessages(prev => [...prev, { id: 'err', text: "Erreur de connexion", fromUser: false }]);
        } finally {
            setIsTyping(false); 
        }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.chatWindow}>
                    <TouchableOpacity activeOpacity={1} style={styles.innerContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Assistant IA</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.closeBtn}>X</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View style={item.fromUser ? styles.userContainer : styles.iaContainer}>
                                    <View style={[styles.msgBubble, item.fromUser ? styles.userBubble : styles.iaBubble]}>
                                        <Text style={item.fromUser ? styles.userText : styles.iaText}>{item.text}</Text>
                                    </View>

                                    {!item.fromUser && item.showChoices && (
                                        <View style={styles.choicesContainer}>
                                            <Text style={styles.choiceQuestion}>Appliquer les filtres de recherche ?</Text>
                                            <View style={styles.choiceButtons}>
                                                <TouchableOpacity 
                                                    style={[styles.btnChoice, styles.btnYes]} 
                                                    onPress={() => handleApplyFilters(item.id, item.filters)}
                                                >
                                                    <Text style={styles.btnTextYes}>Oui</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                style={[styles.btnChoice, styles.btnNo]} 
                                                    onPress={() => handleDeclineChoices(item.id)}
                                                >
                                                    <Text style={styles.btnTextNo}>Non</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            contentContainerStyle={{ padding: 10 }}
                            onContentSizeChange={() => flatListRef.current.scrollToEnd()}
                            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                        />

                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Écrivez ici..."
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, { opacity: isTyping ? 0.5 : 1 }]} 
                                onPress={sendMessage} 
                                disabled={isTyping}
                            >
                                <Image source={require('../../../assets/icons/send.png')} style={{ width: 20, height: 20, tintColor: 'white' }} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    userContainer: { 
        alignSelf: 'flex-end', 
        alignItems: 'flex-end', 
        marginBottom: 8 
    },
    iaContainer: { 
        alignSelf: 'flex-start', 
        alignItems: 'flex-start', 
        marginBottom: 12, 
        width: '100%' 
    },
    msgBubble: { 
        padding: 12, 
        borderRadius: 18, 
        maxWidth: '85%' 
    },
    userBubble: { 
        backgroundColor: '#5856D6' 
    },
    iaBubble: { 
        backgroundColor: '#F0F0F0' 
    },
    userText: { 
        color: 'white' 
    },
    iaText: { 
        color: '#333' 
    },
    choicesContainer: {
        marginTop: 8,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        width: '75%',
        marginLeft: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    choiceQuestion: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
        fontWeight: '500'
    },
    choiceButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    btnChoice: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center'
    },
    btnYes: {
        backgroundColor: '#5856D6',
    },
    btnNo: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    btnTextYes: { 
        color: '#fff', 
        fontWeight: '600' 
    },
    btnTextNo: { 
        color: '#999', 
        fontWeight: '600' 
    },

    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    chatWindow: { 
        width: '85%', 
        height: '75%', 
        backgroundColor: 'white', 
        borderRadius: 20, 
        elevation: 10 
    },
    innerContainer: { 
        flex: 1 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    title: { 
        fontWeight: 'bold', 
        color: '#5856D6' 
    },
    closeBtn: { 
        fontWeight: 'bold', 
        color: '#999' 
    },
    inputContainer: { 
        flexDirection: 'row', 
        padding: 10, 
        borderTopWidth: 1, 
        borderTopColor: '#eee' 
    },
    input: { 
        flex: 1, 
        height: 40, 
        backgroundColor: '#F9F9F9', 
        borderRadius: 20, 
        paddingHorizontal: 15 
    },
    sendBtn: { 
        marginLeft: 10, 
        backgroundColor: '#5856D6', 
        borderRadius: 20, 
        width: 40, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    dot: { 
        width: 6, 
        height: 6,
        borderRadius: 3, 
        backgroundColor: '#999', 
        marginHorizontal: 2 
    }
});