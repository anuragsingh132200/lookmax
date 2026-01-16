import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const features = [
    {
        id: '1',
        icon: '🔬',
        title: 'AI Face Analysis',
        description: 'Get a detailed breakdown of your facial features with our advanced AI technology. Receive personalized scores and insights.',
    },
    {
        id: '2',
        icon: '📊',
        title: 'Personalized Recommendations',
        description: 'Based on your unique features, we provide tailored advice to help you maximize your appearance potential.',
    },
    {
        id: '3',
        icon: '🎓',
        title: 'Expert Courses',
        description: 'Access our comprehensive GlowUp Guide with video tutorials, skincare routines, and grooming tips from experts.',
    },
    {
        id: '4',
        icon: '📈',
        title: 'Track Progress',
        description: 'Monitor your transformation journey with regular scans and see your improvement over time.',
    },
];

export default function FeaturesScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < features.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.push('/(onboarding)/step1');
        }
    };

    const handleSkip = () => {
        router.push('/(onboarding)/step1');
    };

    const renderItem = ({ item }: { item: typeof features[0] }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
    );

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.content}>
                <FlatList
                    ref={flatListRef}
                    data={features}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                />

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {features.map((_, index) => {
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
                                style={[styles.dot, { width: dotWidth, opacity }]}
                            />
                        );
                    })}
                </View>
            </View>

            {/* Next Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === features.length - 1 ? 'Get Started' : 'Next'}
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
    skipButton: {
        position: 'absolute',
        top: 60,
        right: Spacing.lg,
        zIndex: 10,
        padding: Spacing.sm,
    },
    skipText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 80,
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    icon: {
        fontSize: 50,
    },
    slideTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    slideDescription: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: Spacing.lg,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginHorizontal: 4,
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
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
