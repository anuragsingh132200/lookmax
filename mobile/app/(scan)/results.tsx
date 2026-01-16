import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { scanApi } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

export default function ResultsScreen() {
    const { scanId } = useLocalSearchParams();
    const [scan, setScan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUserStore();

    const isSubscribed = user?.subscription?.status === 'active';

    useEffect(() => {
        loadScan();
    }, [scanId]);

    const loadScan = async () => {
        try {
            const response = await scanApi.getScan(scanId as string);
            setScan(response.data);
        } catch (error) {
            console.error('Failed to load scan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlock = () => {
        router.push('/(scan)/subscribe');
    };

    const handleContinue = () => {
        router.replace('/(main)/home');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const analysis = scan?.analysis;

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Analysis</Text>
                    <Text style={styles.subtitle}>
                        {isSubscribed ? 'Here are your detailed results' : 'Unlock your full results'}
                    </Text>
                </View>

                {/* Overall Score */}
                <View style={styles.scoreCard}>
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        style={styles.scoreGradient}
                    >
                        <Text style={styles.scoreLabel}>Overall Score</Text>
                        <View style={styles.scoreContainer}>
                            {!isSubscribed ? (
                                <BlurView intensity={80} style={styles.blurredScore}>
                                    <Text style={styles.scoreValue}>?.?</Text>
                                </BlurView>
                            ) : (
                                <Text style={styles.scoreValue}>{analysis?.overallScore?.toFixed(1)}</Text>
                            )}
                            <Text style={styles.scoreMax}>/10</Text>
                        </View>
                        <Text style={styles.scoreSummary}>
                            {isSubscribed
                                ? analysis?.summary
                                : 'Subscribe to see your personalized analysis'}
                        </Text>
                    </LinearGradient>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category Breakdown</Text>
                    {analysis?.categories?.map((category: any, index: number) => (
                        <View key={index} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                {!isSubscribed ? (
                                    <View style={styles.blurredBadge}>
                                        <Text style={styles.blurredText}>?</Text>
                                    </View>
                                ) : (
                                    <View
                                        style={[
                                            styles.scoreBadge,
                                            { backgroundColor: getScoreColor(category.score) },
                                        ]}
                                    >
                                        <Text style={styles.badgeText}>{category.score}</Text>
                                    </View>
                                )}
                            </View>

                            {isSubscribed ? (
                                <>
                                    <Text style={styles.observation}>{category.observation}</Text>
                                    <View style={styles.recommendations}>
                                        {category.recommendations?.map((rec: string, i: number) => (
                                            <View key={i} style={styles.recommendation}>
                                                <Text style={styles.recBullet}>•</Text>
                                                <Text style={styles.recText}>{rec}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <BlurView intensity={40} style={styles.blurredContent}>
                                    <Text style={styles.lockedText}>🔒 Unlock to see details</Text>
                                </BlurView>
                            )}
                        </View>
                    ))}
                </View>

                {/* Top Priorities */}
                {isSubscribed && analysis?.topPriorities && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Priorities</Text>
                        <View style={styles.prioritiesCard}>
                            {analysis.topPriorities.map((priority: string, index: number) => (
                                <View key={index} style={styles.priorityItem}>
                                    <View style={styles.priorityNumber}>
                                        <Text style={styles.priorityNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.priorityText}>{priority}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {!isSubscribed ? (
                    <TouchableOpacity style={styles.button} onPress={handleUnlock}>
                        <LinearGradient
                            colors={Colors.gradientSecondary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>🔓 Unlock Full Results</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Start Your GlowUp Guide</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </LinearGradient>
    );
}

const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.primary;
    if (score >= 4) return Colors.warning;
    return Colors.error;
};

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
    scoreCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    scoreGradient: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
        opacity: 0.8,
        marginBottom: Spacing.sm,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: '800',
        color: Colors.text,
    },
    scoreMax: {
        fontSize: FontSizes.xxl,
        color: Colors.text,
        opacity: 0.6,
        marginLeft: Spacing.xs,
    },
    blurredScore: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    scoreSummary: {
        fontSize: FontSizes.md,
        color: Colors.text,
        opacity: 0.9,
        textAlign: 'center',
        marginTop: Spacing.md,
        lineHeight: 22,
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
    categoryCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    categoryName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    scoreBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    badgeText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.text,
    },
    blurredBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.textMuted,
    },
    blurredText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.text,
    },
    observation: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    recommendations: {
        gap: Spacing.xs,
    },
    recommendation: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    recBullet: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
    },
    recText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    blurredContent: {
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        alignItems: 'center',
    },
    lockedText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    prioritiesCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    priorityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    priorityNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    priorityNumberText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.text,
    },
    priorityText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.text,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        backgroundColor: Colors.background,
    },
    button: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: Spacing.md,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
});
