import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import api from '../../../services/api';

const { width } = Dimensions.get('window');

export default function ChapterScreen() {
    const router = useRouter();
    const { moduleId, chapterId, title, videoUrl, content, description } = useLocalSearchParams();
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMarkComplete = async () => {
        setLoading(true);
        try {
            await api.post('/api/progress/complete-chapter', {
                moduleId,
                chapterId,
            });
            setIsCompleted(true);
            Alert.alert('Nice!', 'Chapter marked as complete!');
        } catch (error) {
            console.log('Error marking complete:', error);
            // Might already be completed
            setIsCompleted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: title || 'Chapter',
                }}
            />
            <ScrollView style={styles.container}>
                {/* Video Section */}
                {videoUrl && (
                    <View style={styles.videoContainer}>
                        <Video
                            source={{ uri: videoUrl }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            style={styles.video}
                        />
                    </View>
                )}

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{title}</Text>

                    {description && (
                        <Text style={styles.description}>{description}</Text>
                    )}

                    {content && (
                        <View style={styles.articleContainer}>
                            <Text style={styles.articleContent}>{content}</Text>
                        </View>
                    )}

                    {/* Placeholder if no content */}
                    {!videoUrl && !content && (
                        <View style={styles.placeholder}>
                            <Ionicons name="document-text-outline" size={48} color="#666" />
                            <Text style={styles.placeholderText}>
                                Content coming soon!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Complete Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.completeButton,
                            isCompleted && styles.completeButtonDone,
                            loading && styles.completeButtonDisabled,
                        ]}
                        onPress={handleMarkComplete}
                        disabled={isCompleted || loading}
                    >
                        <Ionicons
                            name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.completeButtonText}>
                            {loading ? 'Marking...' : isCompleted ? 'Completed' : 'Mark as Complete'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    videoContainer: {
        width: width,
        height: width * 0.5625, // 16:9 aspect ratio
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    description: {
        color: '#888',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    articleContainer: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 20,
    },
    articleContent: {
        color: '#ddd',
        fontSize: 15,
        lineHeight: 24,
    },
    placeholder: {
        alignItems: 'center',
        padding: 40,
    },
    placeholderText: {
        color: '#888',
        fontSize: 16,
        marginTop: 15,
    },
    footer: {
        padding: 20,
    },
    completeButton: {
        backgroundColor: '#6c5ce7',
        paddingVertical: 16,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    completeButtonDone: {
        backgroundColor: '#00c853',
    },
    completeButtonDisabled: {
        opacity: 0.7,
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
