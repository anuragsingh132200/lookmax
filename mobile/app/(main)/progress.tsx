import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { progressApi, courseApi, scanApi } from '../../services/api';

export default function ProgressScreen() {
    const [progress, setProgress] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [scans, setScans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [progressRes, courseRes, scansRes] = await Promise.all([
                progressApi.getProgress(),
                courseApi.getCourses(),
                scanApi.getScans(),
            ]);
            setProgress(progressRes.data || []);
            setCourses(courseRes.data || []);
            setScans(scansRes.data || []);
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalChapters = courses.reduce((acc, c) => acc + (c.totalChapters || 0), 0);
    const completedChapters = progress.reduce(
        (acc, p) => acc + (p.completedChapters?.length || 0),
        0
    );
    const overallProgress = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Progress</Text>
                    <Text style={styles.subtitle}>Track your transformation journey</Text>
                </View>

                {/* Overall Stats */}
                <View style={styles.statsCard}>
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        style={styles.statsGradient}
                    >
                        <View style={styles.mainStat}>
                            <Text style={styles.mainStatValue}>{overallProgress}%</Text>
                            <Text style={styles.mainStatLabel}>Course Completion</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{completedChapters}</Text>
                                <Text style={styles.statLabel}>Chapters Done</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{scans.length}</Text>
                                <Text style={styles.statLabel}>Face Scans</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{courses.length}</Text>
                                <Text style={styles.statLabel}>Courses</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Course Progress */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Course Progress</Text>
                    {courses.map((course) => {
                        const courseProgress = progress.find(p => p.courseId === course.id);
                        const percent = courseProgress?.percentComplete || 0;
                        return (
                            <View key={course.id} style={styles.progressCard}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressTitle}>{course.title}</Text>
                                    <Text style={styles.progressPercent}>{Math.round(percent)}%</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${percent}%` }]} />
                                </View>
                                <Text style={styles.progressDetail}>
                                    {courseProgress?.completedChapters?.length || 0} of {course.totalChapters} chapters
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Scan History */}
                {scans.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Scan History</Text>
                        {scans.slice(0, 5).map((scan) => (
                            <View key={scan.id} style={styles.scanCard}>
                                <View style={styles.scanScore}>
                                    <Text style={styles.scanScoreValue}>
                                        {scan.analysis?.overallScore?.toFixed(1) || '?'}
                                    </Text>
                                </View>
                                <View style={styles.scanInfo}>
                                    <Text style={styles.scanDate}>
                                        {new Date(scan.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                    <Text style={styles.scanTime}>
                                        {new Date(scan.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {courses.length === 0 && scans.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyTitle}>No Progress Yet</Text>
                        <Text style={styles.emptyText}>
                            Start a course or take a face scan to track your progress
                        </Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
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
    statsCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    statsGradient: {
        padding: Spacing.xl,
    },
    mainStat: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    mainStatValue: {
        fontSize: 56,
        fontWeight: '800',
        color: Colors.text,
    },
    mainStatLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
        opacity: 0.8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.text,
        opacity: 0.7,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    progressCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    progressTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    progressPercent: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 4,
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    progressDetail: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    scanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    scanScore: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    scanScoreValue: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    scanInfo: {},
    scanDate: {
        fontSize: FontSizes.md,
        color: Colors.text,
    },
    scanTime: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
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
        textAlign: 'center',
    },
});
