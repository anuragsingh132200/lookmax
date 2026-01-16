import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const genderOptions = [
    { id: 'male', label: 'Male', icon: '👨' },
    { id: 'female', label: 'Female', icon: '👩' },
    { id: 'other', label: 'Other', icon: '🧑' },
];

const ageRanges = [
    { id: '18-24', label: '18-24' },
    { id: '25-34', label: '25-34' },
    { id: '35-44', label: '35-44' },
    { id: '45+', label: '45+' },
];

export default function OnboardingStep1() {
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');

    const canContinue = gender && ageRange;

    const handleNext = () => {
        if (canContinue) {
            router.push({
                pathname: '/(onboarding)/step2',
                params: { gender, ageRange },
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
                        <View style={[styles.progressFill, { width: '33%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 1 of 3</Text>
                </View>

                {/* Title */}
                <View style={styles.header}>
                    <Text style={styles.title}>Tell us about yourself</Text>
                    <Text style={styles.subtitle}>
                        This helps us personalize your experience
                    </Text>
                </View>

                {/* Gender Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's your gender?</Text>
                    <View style={styles.optionsRow}>
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.genderOption,
                                    gender === option.id && styles.selectedOption,
                                ]}
                                onPress={() => setGender(option.id)}
                            >
                                <Text style={styles.genderIcon}>{option.icon}</Text>
                                <Text
                                    style={[
                                        styles.genderLabel,
                                        gender === option.id && styles.selectedLabel,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Age Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's your age range?</Text>
                    <View style={styles.ageGrid}>
                        {ageRanges.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.ageOption,
                                    ageRange === option.id && styles.selectedOption,
                                ]}
                                onPress={() => setAgeRange(option.id)}
                            >
                                <Text
                                    style={[
                                        styles.ageLabel,
                                        ageRange === option.id && styles.selectedLabel,
                                    ]}
                                >
                                    {option.label}
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
    optionsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    genderOption: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    selectedOption: {
        borderColor: Colors.primary,
        backgroundColor: Colors.backgroundTertiary,
    },
    genderIcon: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    genderLabel: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    selectedLabel: {
        color: Colors.primary,
    },
    ageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    ageOption: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    ageLabel: {
        fontSize: FontSizes.lg,
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
