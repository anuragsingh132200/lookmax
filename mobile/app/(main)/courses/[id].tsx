import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../constants/theme';
import { courseApi, progressApi } from '../../../services/api';

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams();
    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCourse();
    }, [id]);

    const loadCourse = async () => {
        try {
            const [courseRes, progressRes] = await Promise.all([
                courseApi.getCourse(id as string),
                progressApi.getCourseProgress(id as string),
            ]);
            setCourse(courseRes.data);
            setProgress(progressRes.data);
        } catch (error) {
            console.error('Failed to load course:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isChapterCompleted = (chapterId: string) => {
        return progress?.completedChapters?.includes(chapterId);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!course) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Course not found</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={[Colors.background, Colors.backgroundSecondary]}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Course Info */}
                    <View style={styles.courseInfo}>
                        <Text style={styles.courseTitle}>{course.title}</Text>
                        <Text style={styles.courseDescription}>{course.description}</Text>
                        <View style={styles.courseStats}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{course.modules?.length || 0}</Text>
                                <Text style={styles.statLabel}>Modules</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{course.totalChapters}</Text>
                                <Text style={styles.statLabel}>Chapters</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>
                                    {Math.round(course.totalDuration / 60)}
                                </Text>
                                <Text style={styles.statLabel}>Minutes</Text>
                            </View>
                        </View>
                        {progress && (
                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressValue}>
                                        {Math.round(progress.percentComplete)}%
                                    </Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${progress.percentComplete}%` },
                                        ]}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Modules */}
                    {course.modules?.map((module: any, moduleIndex: number) => (
                        <View key={module._id} style={styles.moduleCard}>
                            <View style={styles.moduleHeader}>
                                <View style={styles.moduleNumber}>
                                    <Text style={styles.moduleNumberText}>{moduleIndex + 1}</Text>
                                </View>
                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                    {module.description && (
                                        <Text style={styles.moduleDescription}>
                                            {module.description}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Chapters */}
                            <View style={styles.chapters}>
                                {module.chapters?.map((chapter: any, chapterIndex: number) => {
                                    const completed = isChapterCompleted(chapter._id);
                                    return (
                                        <TouchableOpacity
                                            key={chapter._id}
                                            style={styles.chapterItem}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/(main)/courses/chapter/[id]',
                                                    params: {
                                                        id: chapter._id,
                                                        courseId: course.id,
                                                        title: chapter.title,
                                                        type: chapter.type,
                                                        content: chapter.content,
                                                    },
                                                })
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.chapterCheckbox,
                                                    completed && styles.chapterCompleted,
                                                ]}
                                            >
                                                {completed && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </View>
                                            <View style={styles.chapterInfo}>
                                                <Text
                                                    style={[
                                                        styles.chapterTitle,
                                                        completed && styles.chapterTitleCompleted,
                                                    ]}
                                                >
                                                    {chapter.title}
                                                </Text>
                                                <View style={styles.chapterMeta}>
                                                    <Text style={styles.chapterType}>
                                                        {chapter.type === 'video' ? '🎬' : chapter.type === 'image' ? '🖼️' : '📄'}
                                                    </Text>
                                                    {chapter.duration > 0 && (
                                                        <Text style={styles.chapterDuration}>
                                                            {Math.round(chapter.duration / 60)} min
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <Text style={styles.chapterArrow}>→</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    errorText: {
        fontSize: FontSizes.lg,
        color: Colors.textSecondary,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.md,
    },
    backButton: {
        padding: Spacing.sm,
        alignSelf: 'flex-start',
        marginLeft: -Spacing.sm,
    },
    backText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '500',
    },
    courseInfo: {
        marginBottom: Spacing.xl,
    },
    courseTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    courseDescription: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: Spacing.lg,
    },
    courseStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    progressSection: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    progressLabel: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    progressValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    moduleCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    moduleNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    moduleNumberText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.text,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    moduleDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    chapters: {
        gap: Spacing.sm,
    },
    chapterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    chapterCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    chapterCompleted: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    checkmark: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '700',
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTitle: {
        fontSize: FontSizes.md,
        color: Colors.text,
        marginBottom: 2,
    },
    chapterTitleCompleted: {
        color: Colors.textSecondary,
    },
    chapterMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    chapterType: {
        fontSize: 12,
    },
    chapterDuration: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    chapterArrow: {
        fontSize: FontSizes.lg,
        color: Colors.textMuted,
    },
});
