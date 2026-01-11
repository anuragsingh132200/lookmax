import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services';

const GOALS = [
    { id: 'skin', label: 'Improve Skin', icon: '✨' },
    { id: 'hair', label: 'Better Hair', icon: '💇' },
    { id: 'fitness', label: 'Get Fit', icon: '💪' },
    { id: 'confidence', label: 'Build Confidence', icon: '🎯' },
    { id: 'facial', label: 'Facial Harmony', icon: '👁️' },
    { id: 'overall', label: 'Complete Glow-Up', icon: '🌟' },
];

const SKIN_TYPES = [
    { id: 'oily', label: 'Oily' },
    { id: 'dry', label: 'Dry' },
    { id: 'combination', label: 'Combination' },
    { id: 'normal', label: 'Normal' },
    { id: 'sensitive', label: 'Sensitive' },
];

const FITNESS_LEVELS = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [selectedGoals, setSelectedGoals] = useState([]);
    const [skinType, setSkinType] = useState(null);
    const [fitnessLevel, setFitnessLevel] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleGoal = (goalId) => {
        if (selectedGoals.includes(goalId)) {
            setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
        } else {
            setSelectedGoals([...selectedGoals, goalId]);
        }
    };

    const handleNext = () => {
        if (step === 0 && selectedGoals.length === 0) {
            Alert.alert('Please select at least one goal');
            return;
        }
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await authService.saveOnboarding({
                goals: selectedGoals,
                skinType,
                fitnessLevel,
            });
            router.replace('/scanner');
        } catch (error) {
            console.log('Error saving onboarding:', error);
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>What are your goals?</Text>
                        <Text style={styles.stepSubtitle}>
                            Select all that apply to personalize your experience
                        </Text>
                        <View style={styles.goalsGrid}>
                            {GOALS.map((goal) => (
                                <TouchableOpacity
                                    key={goal.id}
                                    style={[
                                        styles.goalCard,
                                        selectedGoals.includes(goal.id) && styles.goalCardSelected,
                                    ]}
                                    onPress={() => toggleGoal(goal.id)}
                                >
                                    <Text style={styles.goalEmoji}>{goal.icon}</Text>
                                    <Text style={styles.goalLabel}>{goal.label}</Text>
                                    {selectedGoals.includes(goal.id) && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 1:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>What's your skin type?</Text>
                        <Text style={styles.stepSubtitle}>
                            This helps us recommend the right skincare routine
                        </Text>
                        <View style={styles.optionsList}>
                            {SKIN_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.optionCard,
                                        skinType === type.id && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setSkinType(type.id)}
                                >
                                    <Text style={styles.optionLabel}>{type.label}</Text>
                                    {skinType === type.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#6c5ce7" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>What's your fitness level?</Text>
                        <Text style={styles.stepSubtitle}>
                            We'll adjust workout recommendations accordingly
                        </Text>
                        <View style={styles.optionsList}>
                            {FITNESS_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level.id}
                                    style={[
                                        styles.optionCard,
                                        fitnessLevel === level.id && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setFitnessLevel(level.id)}
                                >
                                    <Text style={styles.optionLabel}>{level.label}</Text>
                                    {fitnessLevel === level.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#6c5ce7" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Progress Indicator */}
            <View style={styles.progress}>
                {[0, 1, 2].map((i) => (
                    <View
                        key={i}
                        style={[styles.progressDot, step >= i && styles.progressDotActive]}
                    />
                ))}
            </View>

            <ScrollView style={styles.scrollView}>{renderStep()}</ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
                {step > 0 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setStep(step - 1)}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.nextButtonText}>
                        {loading ? 'Saving...' : step === 2 ? 'Start Scan' : 'Next'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    progress: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 10,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2d2d44',
    },
    progressDotActive: {
        backgroundColor: '#6c5ce7',
        width: 30,
    },
    scrollView: {
        flex: 1,
    },
    stepContent: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    stepSubtitle: {
        color: '#888',
        fontSize: 16,
        marginBottom: 30,
    },
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    goalCard: {
        width: '47%',
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    goalCardSelected: {
        borderColor: '#6c5ce7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
    },
    goalEmoji: {
        fontSize: 36,
        marginBottom: 10,
    },
    goalLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        padding: 2,
    },
    optionsList: {
        gap: 12,
    },
    optionCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: '#6c5ce7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
    },
    optionLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    navigation: {
        flexDirection: 'row',
        padding: 20,
        gap: 15,
    },
    backButton: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    nextButtonDisabled: {
        opacity: 0.7,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
