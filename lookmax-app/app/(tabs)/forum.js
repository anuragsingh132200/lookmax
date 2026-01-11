import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';
import api from '../../services/api';

export default function ForumScreen() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await api.get('/api/community/posts');
            setPosts(response.data);
        } catch (error) {
            console.log('Error loading posts:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const createPost = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;

        try {
            await api.post('/api/community/posts', {
                title: newTitle.trim(),
                content: newContent.trim(),
            });
            setShowNewPost(false);
            setNewTitle('');
            setNewContent('');
            loadPosts();
        } catch (error) {
            console.log('Error creating post:', error);
        }
    };

    const likePost = async (postId) => {
        try {
            await api.post(`/api/community/posts/${postId}/like`);
            loadPosts();
        } catch (error) {
            console.log('Error liking post:', error);
        }
    };

    const renderPost = ({ item }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.userName?.charAt(0) || 'U'}</Text>
                </View>
                <View style={styles.postInfo}>
                    <Text style={styles.postAuthor}>{item.userName}</Text>
                    <Text style={styles.postTime}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <View style={styles.postActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => likePost(item.id)}
                >
                    <Ionicons
                        name={item.likes?.includes(user?.id) ? 'heart' : 'heart-outline'}
                        size={22}
                        color={item.likes?.includes(user?.id) ? '#ff6b6b' : '#888'}
                    />
                    <Text style={styles.actionText}>{item.likesCount || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#888" />
                    <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-outline" size={20} color="#888" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#666" />
                        <Text style={styles.emptyText}>No posts yet</Text>
                        <Text style={styles.emptySubtext}>Be the first to share!</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowNewPost(true)}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* New Post Modal */}
            <Modal
                visible={showNewPost}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Post</Text>
                            <TouchableOpacity onPress={() => setShowNewPost(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Post title..."
                            placeholderTextColor="#666"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                        <TextInput
                            style={styles.contentInput}
                            placeholder="What's on your mind?"
                            placeholderTextColor="#666"
                            value={newContent}
                            onChangeText={setNewContent}
                            multiline
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.postButton} onPress={createPost}>
                            <Text style={styles.postButtonText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    postCard: {
        backgroundColor: '#1a1a2e',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    postInfo: {
        flex: 1,
    },
    postAuthor: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    postTime: {
        color: '#888',
        fontSize: 13,
    },
    postTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    postContent: {
        color: '#ccc',
        fontSize: 15,
        lineHeight: 22,
    },
    postActions: {
        flexDirection: 'row',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#2d2d44',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25,
    },
    actionText: {
        color: '#888',
        marginLeft: 6,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 16,
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    titleInput: {
        backgroundColor: '#2d2d44',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        marginBottom: 15,
    },
    contentInput: {
        backgroundColor: '#2d2d44',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        minHeight: 150,
        marginBottom: 20,
    },
    postButton: {
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    postButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
