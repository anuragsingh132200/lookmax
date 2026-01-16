import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';
import api from '../../services/api';

const CATEGORY_ICONS = {
    skin: 'sparkles',
    hair: 'cut',
    gym: 'barbell',
    mental: 'brain',
    facial: 'happy',
    default: 'book',
};

const CATEGORY_COLORS = {
    skin: '#00cec9',
    hair: '#e17055',
    gym: '#6c5ce7',
    mental: '#fdcb6e',
    facial: '#ff7675',
    default: '#74b9ff',
};

export default function CoursesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [coursesRes, progressRes] = await Promise.all([
                api.get('/api/content/courses'),
                api.get('/api/progress/user'),
            ]);
            setCourses(coursesRes.data);
            setProgress(progressRes.data);
        } catch (error) {
            console.log('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getModuleProgress = (moduleId) => {
        if (!progress?.moduleProgress?.[moduleId]) {
            return { percentage: 0, completed: 0, total: 0 };
        }
        return progress.moduleProgress[moduleId];
    };

    const handleModulePress = (course, moduleIndex) => {
        const module = course.modules[moduleIndex];
        if (module.chapters?.length > 0) {
            router.push({
                pathname: '/courses/[moduleId]',
                params: {
                    moduleId: module.id,
                    courseId: course.id,
                    moduleTitle: module.title
                }
            });
        } else {
            // Module without chapters - just show video/content
            router.push({
                pathname: '/courses/[moduleId]/[chapterId]',
                params: {
                    moduleId: module.id,
                    chapterId: 'main',
                    courseId: course.id,
                    title: module.title,
                    videoUrl: module.videoUrl,
                    content: module.content
                }
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Glow-Up Guide</Text>
                <Text style={styles.headerSubtitle}>
                    Your personalized course library
                </Text>
            </View>

            {/* Overall Progress */}
            {progress && (
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Ionicons name="trophy" size={24} color="#ffd700" />
                        <Text style={styles.progressTitle}>Your Progress</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progress.overallPercentage}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {progress.totalCompleted} of {progress.totalChapters} completed ({progress.overallPercentage}%)
                    </Text>
                </View>
            )}

            {/* Courses */}
            {courses.map((course) => (
                <View key={course.id} style={styles.courseSection}>
                    <View style={styles.courseHeader}>
                        <View style={[
                            styles.categoryIcon,
                            { backgroundColor: `${CATEGORY_COLORS[course.category] || CATEGORY_COLORS.default}20` }
                        ]}>
                            <Ionicons
                                name={CATEGORY_ICONS[course.category] || CATEGORY_ICONS.default}
                                size={24}
                                color={CATEGORY_COLORS[course.category] || CATEGORY_COLORS.default}
                            />
                        </View>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            <Text style={styles.courseDescription}>{course.description}</Text>
                        </View>
                    </View>

                    {/* Modules */}
                    {course.modules?.map((module, index) => {
                        const moduleProgress = getModuleProgress(module.id);
                        return (
                            <TouchableOpacity
                                key={module.id || index}
                                style={styles.moduleCard}
                                onPress={() => handleModulePress(course, index)}
                            >
                                <View style={styles.moduleNumber}>
                                    <Text style={styles.moduleNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.moduleContent}>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                    {module.description && (
                                        <Text style={styles.moduleDescription} numberOfLines={2}>
                                            {module.description}
                                        </Text>
                                    )}
                                    {moduleProgress.total > 0 && (
                                        <View style={styles.moduleProgressContainer}>
                                            <View style={styles.moduleProgressBar}>
                                                <View
                                                    style={[
                                                        styles.moduleProgressFill,
                                                        { width: `${moduleProgress.percentage}%` }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.moduleProgressText}>
                                                {moduleProgress.percentage}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#666" />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            {courses.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="book-outline" size={64} color="#666" />
                    <Text style={styles.emptyTitle}>No Courses Available</Text>
                    <Text style={styles.emptyText}>
                        Check back soon for new content!
                    </Text>
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
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
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 5,
    },
    progressCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 25,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    progressTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2d2d44',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6c5ce7',
        borderRadius: 4,
    },
    progressText: {
        color: '#888',
        fontSize: 14,
    },
    courseSection: {
        marginBottom: 25,
        paddingHorizontal: 20,
    },
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    categoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    courseInfo: {
        flex: 1,
    },
    courseTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    courseDescription: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    moduleCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    moduleNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    moduleNumberText: {
        color: '#6c5ce7',
        fontWeight: 'bold',
        fontSize: 16,
    },
    moduleContent: {
        flex: 1,
    },
    moduleTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    moduleDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    moduleProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10,
    },
    moduleProgressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#2d2d44',
        borderRadius: 2,
    },
    moduleProgressFill: {
        height: '100%',
        backgroundColor: '#00c853',
        borderRadius: 2,
    },
    moduleProgressText: {
        color: '#00c853',
        fontSize: 12,
        fontWeight: '600',
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
