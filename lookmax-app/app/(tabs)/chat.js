import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ChatScreen() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const loadChats = async () => {
        try {
            const response = await api.get('/api/community/chats');
            setChats(response.data);
        } catch (error) {
            console.log('Error loading chats:', error);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const response = await api.get(`/api/community/chat/${chatId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.log('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const response = await api.post('/api/community/chat/messages', {
                chatId: selectedChat.id,
                content: newMessage.trim(),
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.log('Error sending message:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (selectedChat) {
            await loadMessages(selectedChat.id);
        } else {
            await loadChats();
        }
        setRefreshing(false);
    };

    if (selectedChat) {
        return (
            <View style={styles.container}>
                {/* Chat Header */}
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => setSelectedChat(null)}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.chatTitle}>{selectedChat.name}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Messages */}
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.messageItem}>
                            <Text style={styles.messageSender}>{item.userName}</Text>
                            <Text style={styles.messageContent}>{item.content}</Text>
                            <Text style={styles.messageTime}>
                                {new Date(item.createdAt).toLocaleTimeString()}
                            </Text>
                        </View>
                    )}
                />

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                        value={newMessage}
                        onChangeText={setNewMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => setSelectedChat(item)}
                    >
                        <View style={styles.chatIcon}>
                            <Text style={styles.chatEmoji}>{item.icon}</Text>
                        </View>
                        <View style={styles.chatInfo}>
                            <Text style={styles.chatName}>{item.name}</Text>
                            <Text style={styles.chatDescription}>{item.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    chatItem: {
        backgroundColor: '#1a1a2e',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    chatIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chatEmoji: {
        fontSize: 24,
    },
    chatInfo: {
        flex: 1,
    },
    chatName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    chatDescription: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    chatTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messagesList: {
        flex: 1,
        padding: 15,
    },
    messageItem: {
        backgroundColor: '#1a1a2e',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    messageSender: {
        color: '#6c5ce7',
        fontWeight: '600',
        marginBottom: 5,
    },
    messageContent: {
        color: '#fff',
        fontSize: 15,
    },
    messageTime: {
        color: '#666',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#1a1a2e',
        borderTopWidth: 1,
        borderTopColor: '#2d2d44',
    },
    input: {
        flex: 1,
        backgroundColor: '#2d2d44',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        color: '#fff',
        marginRight: 10,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
