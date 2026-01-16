import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        id: '1',
        icon: 'scan',
        title: 'AI Face Scanner',
        description: 'Get a detailed analysis of your facial features using advanced AI technology. Understand your unique characteristics and areas for improvement.',
        color: '#6c5ce7',
    },
    {
        id: '2',
        icon: 'sparkles',
        title: 'Personalized Glow-Up Plan',
        description: 'Receive a customized improvement plan tailored to your goals, skin type, and lifestyle. Get actionable recommendations.',
        color: '#00cec9',
    },
    {
        id: '3',
        icon: 'play-circle',
        title: 'Premium Video Courses',
        description: 'Access expert-led courses on skincare, haircare, fitness, and self-improvement. Learn from the best in the industry.',
        color: '#fdcb6e',
    },
    {
        id: '4',
        icon: 'trending-up',
        title: 'Progress Tracking',
        description: 'Track your transformation journey over time. Compare scans, monitor improvements, and celebrate your glow-up milestones.',
        color: '#e17055',
    },
];

export default function FeaturesScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    const handleNext = () => {
        if (currentIndex < FEATURES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleGetStarted();
        }
    };

    const handleGetStarted = async () => {
        try {
            // Mark feature highlights as seen
            await authService.updateUserState({ hasSeenFeatureHighlights: true });
        } catch (error) {
            console.log('Error updating state:', error);
        }
        router.replace('/(auth)/onboarding');
    };

    const handleSkip = () => {
        handleGetStarted();
    };

    const renderItem = ({ item, index }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.slide, { opacity, transform: [{ scale }] }]}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={80} color={item.color} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
        );
    };

    const renderDots = () => {
        return (
            <View style={styles.pagination}>
                {FEATURES.map((_, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    opacity,
                                    backgroundColor: FEATURES[currentIndex].color,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Skip button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Features carousel */}
            <Animated.FlatList
                ref={flatListRef}
                data={FEATURES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(newIndex);
                }}
                scrollEventThrottle={16}
            />

            {/* Pagination dots */}
            {renderDots()}

            {/* Navigation button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: FEATURES[currentIndex].color }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === FEATURES.length - 1 ? 'Get Started' : 'Next'}
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
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
    },
    skipText: {
        color: '#888',
        fontSize: 16,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        paddingTop: 100,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    nextButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
