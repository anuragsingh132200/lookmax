import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { useUserStore } from '../../stores/userStore';
import { scanApi, courseApi, progressApi } from '../../services/api';

export default function HomeScreen() {
    const { user } = useUserStore();
    const [latestScan, setLatestScan] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [progress, setProgress] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const isSubscribed = user?.subscription?.status === 'active';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [scanRes, courseRes, progressRes] = await Promise.all([
                scanApi.getLatest().catch(() => null),
                courseApi.getCourses(),
                progressApi.getProgress(),
            ]);

            if (scanRes?.data) setLatestScan(scanRes.data);
            setCourses(courseRes.data || []);
            setProgress(progressRes.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.name}>{user?.name || 'User'} 👋</Text>
                    </View>
                    {isSubscribed && (
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>👑 Premium</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(main)/scan')}
                    >
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            style={styles.actionGradient}
                        >
                            <Text style={styles.actionIcon}>📷</Text>
                            <Text style={styles.actionTitle}>New Scan</Text>
                            <Text style={styles.actionSubtitle}>Analyze your face</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(main)/courses')}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            style={styles.actionGradient}
                        >
                            <Text style={styles.actionIcon}>🎓</Text>
                            <Text style={styles.actionTitle}>Courses</Text>
                            <Text style={styles.actionSubtitle}>Continue learning</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Latest Scan */}
                {latestScan && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Latest Scan</Text>
                            <TouchableOpacity onPress={() => router.push('/(main)/scan')}>
                                <Text style={styles.seeAll}>View All →</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.scanCard}
                            onPress={() => router.push({
                                pathname: '/(scan)/results',
                                params: { scanId: latestScan.id }
                            })}
                        >
                            <View style={styles.scanInfo}>
                                <View style={styles.scoreCircle}>
                                    <Text style={styles.scoreText}>
                                        {isSubscribed
                                            ? latestScan.analysis?.overallScore?.toFixed(1)
                                            : '?'}
                                    </Text>
                                </View>
                                <View style={styles.scanDetails}>
                                    <Text style={styles.scanTitle}>Face Analysis</Text>
                                    <Text style={styles.scanDate}>
                                        {new Date(latestScan.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.scanArrow}>→</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Courses */}
                {courses.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>GlowUp Courses</Text>
                            <TouchableOpacity onPress={() => router.push('/(main)/courses')}>
                                <Text style={styles.seeAll}>See All →</Text>
                            </TouchableOpacity>
                        </View>
                        {courses.slice(0, 2).map((course) => {
                            const courseProgress = progress.find(p => p.courseId === course.id);
                            return (
                                <TouchableOpacity
                                    key={course.id}
                                    style={styles.courseCard}
                                    onPress={() => router.push(`/(main)/courses/${course.id}`)}
                                >
                                    <View style={styles.courseInfo}>
                                        <Text style={styles.courseTitle}>{course.title}</Text>
                                        <Text style={styles.courseDescription} numberOfLines={2}>
                                            {course.description}
                                        </Text>
                                        <View style={styles.courseStats}>
                                            <Text style={styles.courseStat}>
                                                📚 {course.totalChapters} chapters
                                            </Text>
                                            <Text style={styles.courseStat}>
                                                ⏱️ {Math.round(course.totalDuration / 60)} min
                                            </Text>
                                        </View>
                                        {courseProgress && (
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${courseProgress.percentComplete}%` },
                                                    ]}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Upgrade Banner (if not subscribed) */}
                {!isSubscribed && (
                    <TouchableOpacity
                        style={styles.upgradeCard}
                        onPress={() => router.push('/(scan)/subscribe')}
                    >
                        <LinearGradient
                            colors={Colors.gradientSecondary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upgradeGradient}
                        >
                            <Text style={styles.upgradeIcon}>👑</Text>
                            <View style={styles.upgradeInfo}>
                                <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                                <Text style={styles.upgradeSubtitle}>
                                    Unlock full analysis & courses
                                </Text>
                            </View>
                            <Text style={styles.upgradeArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Tips Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Tips</Text>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>💡</Text>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Stay Hydrated</Text>
                            <Text style={styles.tipText}>
                                Drinking enough water is crucial for skin health. Aim for 8 glasses a day!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    name: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
    },
    premiumBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    premiumText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.background,
    },
    quickActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadows.md,
    },
    actionGradient: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    actionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    actionSubtitle: {
        fontSize: FontSizes.sm,
        color: Colors.text,
        opacity: 0.8,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    seeAll: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '500',
    },
    scanCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    scanInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    scoreText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    scanDetails: {},
    scanTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    scanDate: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    scanArrow: {
        fontSize: FontSizes.xl,
        color: Colors.textMuted,
    },
    courseCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    courseInfo: {},
    courseTitle: {
        fontSize: FontSizes.md,
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
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    courseStat: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    progressBar: {
        height: 4,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    upgradeCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
        ...Shadows.lg,
    },
    upgradeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    upgradeIcon: {
        fontSize: 32,
        marginRight: Spacing.md,
    },
    upgradeInfo: {
        flex: 1,
    },
    upgradeTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    upgradeSubtitle: {
        fontSize: FontSizes.sm,
        color: Colors.text,
        opacity: 0.8,
    },
    upgradeArrow: {
        fontSize: FontSizes.xxl,
        color: Colors.text,
    },
    tipCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tipIcon: {
        fontSize: 28,
        marginRight: Spacing.md,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    tipText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
