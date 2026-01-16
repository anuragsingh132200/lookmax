import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const goals = [
    { id: 'skin', label: 'Improve Skin Quality', icon: '✨' },
    { id: 'jawline', label: 'Define Jawline', icon: '💪' },
    { id: 'symmetry', label: 'Improve Symmetry', icon: '⚖️' },
    { id: 'grooming', label: 'Better Grooming', icon: '💈' },
    { id: 'style', label: 'Upgrade Style', icon: '👔' },
    { id: 'confidence', label: 'Build Confidence', icon: '🔥' },
];

const skinTypes = [
    { id: 'oily', label: 'Oily' },
    { id: 'dry', label: 'Dry' },
    { id: 'combination', label: 'Combination' },
    { id: 'normal', label: 'Normal' },
    { id: 'sensitive', label: 'Sensitive' },
];

export default function OnboardingStep2() {
    const params = useLocalSearchParams();
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [skinType, setSkinType] = useState('');

    const toggleGoal = (goalId: string) => {
        setSelectedGoals((prev) =>
            prev.includes(goalId)
                ? prev.filter((id) => id !== goalId)
                : [...prev, goalId]
        );
    };

    const canContinue = selectedGoals.length > 0 && skinType;

    const handleNext = () => {
        if (canContinue) {
            router.push({
                pathname: '/(onboarding)/step3',
                params: {
                    ...params,
                    goals: selectedGoals.join(','),
                    skinType,
                },
            });
        }
    };

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '66%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 2 of 3</Text>
                </View>

                {/* Title */}
                <View style={styles.header}>
                    <Text style={styles.title}>What are your goals?</Text>
                    <Text style={styles.subtitle}>
                        Select all that apply (at least one)
                    </Text>
                </View>

                {/* Goals */}
                <View style={styles.section}>
                    <View style={styles.goalsGrid}>
                        {goals.map((goal) => (
                            <TouchableOpacity
                                key={goal.id}
                                style={[
                                    styles.goalOption,
                                    selectedGoals.includes(goal.id) && styles.selectedOption,
                                ]}
                                onPress={() => toggleGoal(goal.id)}
                            >
                                <Text style={styles.goalIcon}>{goal.icon}</Text>
                                <Text
                                    style={[
                                        styles.goalLabel,
                                        selectedGoals.includes(goal.id) && styles.selectedLabel,
                                    ]}
                                >
                                    {goal.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Skin Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's your skin type?</Text>
                    <View style={styles.skinGrid}>
                        {skinTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.skinOption,
                                    skinType === type.id && styles.selectedOption,
                                ]}
                                onPress={() => setSkinType(type.id)}
                            >
                                <Text
                                    style={[
                                        styles.skinLabel,
                                        skinType === type.id && styles.selectedLabel,
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !canContinue && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!canContinue}
                >
                    <LinearGradient
                        colors={canContinue ? Colors.gradientPrimary : [Colors.card, Colors.card]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
                            Continue
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
        paddingTop: 60,
    },
    progressContainer: {
        marginBottom: Spacing.xl,
    },
    progressBar: {
        height: 4,
        backgroundColor: Colors.card,
        borderRadius: 2,
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    progressText: {
        color: Colors.textMuted,
        fontSize: FontSizes.sm,
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
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    goalOption: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    selectedOption: {
        borderColor: Colors.primary,
        backgroundColor: Colors.backgroundTertiary,
    },
    goalIcon: {
        fontSize: 28,
        marginBottom: Spacing.xs,
    },
    goalLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedLabel: {
        color: Colors.primary,
    },
    skinGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    skinOption: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.full,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    skinLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    button: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.6,
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
    buttonTextDisabled: {
        color: Colors.textMuted,
    },
});
