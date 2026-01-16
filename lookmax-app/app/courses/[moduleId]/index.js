import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ModuleScreen() {
    const router = useRouter();
    const { moduleId, courseId, moduleTitle } = useLocalSearchParams();
    const [chapters, setChapters] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [moduleId]);

    const loadData = async () => {
        try {
            const [coursesRes, progressRes] = await Promise.all([
                api.get('/api/content/courses'),
                api.get(`/api/progress/module/${moduleId}`),
            ]);

            // Find the module and its chapters
            for (const course of coursesRes.data) {
                for (const module of course.modules || []) {
                    if (module.id === moduleId) {
                        setChapters(module.chapters || []);
                        break;
                    }
                }
            }

            setProgress(progressRes.data.completedChapters || []);
        } catch (error) {
            console.log('Error loading module:', error);
        } finally {
            setLoading(false);
        }
    };

    const isChapterCompleted = (chapterId) => {
        return progress.some(p => p.chapterId === chapterId);
    };

    const handleChapterPress = (chapter) => {
        router.push({
            pathname: `/courses/${moduleId}/${chapter.id}`,
            params: {
                title: chapter.title,
                videoUrl: chapter.videoUrl || '',
                content: chapter.content || '',
                description: chapter.description || '',
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: moduleTitle || 'Module',
                }}
            />
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.moduleTitle}>{moduleTitle}</Text>
                    <Text style={styles.chapterCount}>
                        {chapters.length} chapters • {progress.length} completed
                    </Text>
                </View>

                {/* Chapters */}
                {chapters.map((chapter, index) => {
                    const isCompleted = isChapterCompleted(chapter.id);
                    return (
                        <TouchableOpacity
                            key={chapter.id || index}
                            style={[
                                styles.chapterCard,
                                isCompleted && styles.chapterCardCompleted
                            ]}
                            onPress={() => handleChapterPress(chapter)}
                        >
                            <View style={[
                                styles.chapterNumber,
                                isCompleted && styles.chapterNumberCompleted
                            ]}>
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                ) : (
                                    <Text style={styles.chapterNumberText}>{index + 1}</Text>
                                )}
                            </View>
                            <View style={styles.chapterContent}>
                                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                                {chapter.description && (
                                    <Text style={styles.chapterDescription} numberOfLines={2}>
                                        {chapter.description}
                                    </Text>
                                )}
                                <View style={styles.chapterMeta}>
                                    {chapter.videoUrl && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="play-circle" size={14} color="#6c5ce7" />
                                            <Text style={styles.metaText}>Video</Text>
                                        </View>
                                    )}
                                    {chapter.content && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="document-text" size={14} color="#6c5ce7" />
                                            <Text style={styles.metaText}>Article</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    );
                })}

                {chapters.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-open-outline" size={64} color="#666" />
                        <Text style={styles.emptyTitle}>No Chapters</Text>
                        <Text style={styles.emptyText}>
                            This module doesn't have any chapters yet.
                        </Text>
                    </View>
                )}

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
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    moduleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    chapterCount: {
        color: '#888',
        fontSize: 14,
    },
    chapterCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 20,
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chapterCardCompleted: {
        borderWidth: 1,
        borderColor: '#00c853',
    },
    chapterNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chapterNumberCompleted: {
        backgroundColor: '#00c853',
    },
    chapterNumberText: {
        color: '#6c5ce7',
        fontWeight: 'bold',
        fontSize: 16,
    },
    chapterContent: {
        flex: 1,
    },
    chapterTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chapterDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    chapterMeta: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: '#6c5ce7',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
});
