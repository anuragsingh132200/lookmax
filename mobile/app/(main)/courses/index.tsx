import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../constants/theme';
import { courseApi, progressApi } from '../../../services/api';

export default function CoursesScreen() {
    const [courses, setCourses] = useState<any[]>([]);
    const [progress, setProgress] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const [courseRes, progressRes] = await Promise.all([
                courseApi.getCourses(),
                progressApi.getProgress(),
            ]);
            setCourses(courseRes.data || []);
            setProgress(progressRes.data || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
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
                        <Text style={styles.title}>GlowUp Guide</Text>
                        <Text style={styles.subtitle}>
                            Master your transformation with expert courses
                        </Text>
                    </View>

                    {/* Courses */}
                    {courses.map((course) => {
                        const courseProgress = progress.find(p => p.courseId === course.id);
                        return (
                            <TouchableOpacity
                                key={course.id}
                                style={styles.courseCard}
                                onPress={() => router.push(`/(main)/courses/${course.id}`)}
                            >
                                <View style={styles.courseThumbnail}>
                                    <Text style={styles.thumbnailEmoji}>📚</Text>
                                </View>
                                <View style={styles.courseContent}>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <Text style={styles.courseDescription} numberOfLines={2}>
                                        {course.description}
                                    </Text>
                                    <View style={styles.courseStats}>
                                        <Text style={styles.courseStat}>
                                            {course.modules?.length || 0} modules
                                        </Text>
                                        <Text style={styles.courseStat}>•</Text>
                                        <Text style={styles.courseStat}>
                                            {course.totalChapters} chapters
                                        </Text>
                                    </View>
                                    {courseProgress && courseProgress.percentComplete > 0 && (
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${courseProgress.percentComplete}%` },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {Math.round(courseProgress.percentComplete)}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {courses.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📖</Text>
                            <Text style={styles.emptyTitle}>No Courses Available</Text>
                            <Text style={styles.emptyText}>
                                Check back soon for new content!
                            </Text>
                        </View>
                    )}
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
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    courseThumbnail: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.backgroundTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    thumbnailEmoji: {
        fontSize: 32,
    },
    courseContent: {
        flex: 1,
    },
    courseTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    courseDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.sm,
    },
    courseStats: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    courseStat: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: FontSizes.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
});
