import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { userApi } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

const concerns = [
    { id: 'acne', label: 'Acne' },
    { id: 'wrinkles', label: 'Wrinkles' },
    { id: 'dark_circles', label: 'Dark Circles' },
    { id: 'pigmentation', label: 'Pigmentation' },
    { id: 'pores', label: 'Large Pores' },
    { id: 'redness', label: 'Redness' },
    { id: 'dullness', label: 'Dull Skin' },
    { id: 'texture', label: 'Uneven Texture' },
];

const routines = [
    { id: 'none', label: 'No routine', description: 'I don\'t have a skincare routine' },
    { id: 'basic', label: 'Basic', description: 'Cleanser + Moisturizer' },
    { id: 'intermediate', label: 'Intermediate', description: 'Multiple products daily' },
    { id: 'advanced', label: 'Advanced', description: 'Full routine with serums & treatments' },
];

export default function OnboardingStep3() {
    const params = useLocalSearchParams();
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
    const [currentRoutine, setCurrentRoutine] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useUserStore();

    const toggleConcern = (concernId: string) => {
        setSelectedConcerns((prev) =>
            prev.includes(concernId)
                ? prev.filter((id) => id !== concernId)
                : [...prev, concernId]
        );
    };

    const canContinue = currentRoutine;

    const handleComplete = async () => {
        if (!canContinue) return;

        setIsLoading(true);
        try {
            // Parse age from range
            const ageRange = params.ageRange as string;
            const age = parseInt(ageRange?.split('-')[0] || '25');

            const onboardingData = {
                age,
                gender: params.gender as string,
                goals: (params.goals as string)?.split(',') || [],
                skinType: params.skinType as string,
                concerns: selectedConcerns,
                currentRoutine,
            };

            await userApi.saveOnboarding(onboardingData);
            updateUser({ isOnboarded: true, onboarding: onboardingData });

            router.replace('/(scan)/scanner');
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to save your preferences. Please try again.'
            );
        } finally {
            setIsLoading(false);
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
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 3 of 3</Text>
                </View>

                {/* Title */}
                <View style={styles.header}>
                    <Text style={styles.title}>Almost there!</Text>
                    <Text style={styles.subtitle}>
                        Just a few more details to personalize your experience
                    </Text>
                </View>

                {/* Concerns */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Any skin concerns? (optional)</Text>
                    <View style={styles.concernsGrid}>
                        {concerns.map((concern) => (
                            <TouchableOpacity
                                key={concern.id}
                                style={[
                                    styles.concernOption,
                                    selectedConcerns.includes(concern.id) && styles.selectedConcern,
                                ]}
                                onPress={() => toggleConcern(concern.id)}
                            >
                                <Text
                                    style={[
                                        styles.concernLabel,
                                        selectedConcerns.includes(concern.id) && styles.selectedLabel,
                                    ]}
                                >
                                    {concern.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Current Routine */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your current routine</Text>
                    {routines.map((routine) => (
                        <TouchableOpacity
                            key={routine.id}
                            style={[
                                styles.routineOption,
                                currentRoutine === routine.id && styles.selectedRoutine,
                            ]}
                            onPress={() => setCurrentRoutine(routine.id)}
                        >
                            <View style={styles.routineContent}>
                                <Text
                                    style={[
                                        styles.routineLabel,
                                        currentRoutine === routine.id && styles.selectedLabel,
                                    ]}
                                >
                                    {routine.label}
                                </Text>
                                <Text style={styles.routineDescription}>{routine.description}</Text>
                            </View>
                            <View
                                style={[
                                    styles.radioCircle,
                                    currentRoutine === routine.id && styles.radioSelected,
                                ]}
                            >
                                {currentRoutine === routine.id && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, (!canContinue || isLoading) && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={!canContinue || isLoading}
                >
                    <LinearGradient
                        colors={canContinue ? Colors.gradientPrimary : [Colors.card, Colors.card]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.text} />
                        ) : (
                            <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
                                Complete Setup
                            </Text>
                        )}
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
    concernsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    concernOption: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.full,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    selectedConcern: {
        borderColor: Colors.primary,
        backgroundColor: Colors.backgroundTertiary,
    },
    concernLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    selectedLabel: {
        color: Colors.primary,
    },
    routineOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    selectedRoutine: {
        borderColor: Colors.primary,
        backgroundColor: Colors.backgroundTertiary,
    },
    routineContent: {
        flex: 1,
    },
    routineLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    routineDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
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
