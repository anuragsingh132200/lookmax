import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../../../constants/theme';
import { progressApi } from '../../../../services/api';

const { width } = Dimensions.get('window');

export default function ChapterScreen() {
    const { id, courseId, title, type, content } = useLocalSearchParams();
    const [isCompleted, setIsCompleted] = useState(false);

    const handleComplete = async () => {
        try {
            await progressApi.completeChapter(courseId as string, id as string);
            setIsCompleted(true);
        } catch (error) {
            console.error('Failed to mark chapter complete:', error);
        }
    };

    const handleNext = () => {
        router.back();
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={[Colors.background, Colors.backgroundSecondary]}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {type === 'video' ? (
                            <View style={styles.videoContainer}>
                                <Video
                                    source={{ uri: content as string }}
                                    style={styles.video}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping={false}
                                />
                            </View>
                        ) : type === 'image' ? (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: content as string }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </View>
                        ) : (
                            <View style={styles.textContainer}>
                                <Text style={styles.textContent}>{content}</Text>
                            </View>
                        )}
                    </View>

                    {/* Notes */}
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Key Takeaways</Text>
                        <View style={styles.noteItem}>
                            <Text style={styles.noteBullet}>•</Text>
                            <Text style={styles.noteText}>
                                Practice consistently for best results
                            </Text>
                        </View>
                        <View style={styles.noteItem}>
                            <Text style={styles.noteBullet}>•</Text>
                            <Text style={styles.noteText}>
                                Be patient - changes take time
                            </Text>
                        </View>
                        <View style={styles.noteItem}>
                            <Text style={styles.noteBullet}>•</Text>
                            <Text style={styles.noteText}>
                                Track your progress regularly
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    {!isCompleted ? (
                        <TouchableOpacity style={styles.button} onPress={handleComplete}>
                            <LinearGradient
                                colors={Colors.gradientPrimary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Mark as Complete ✓</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <LinearGradient
                                colors={[Colors.success, Colors.success]}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Completed! Continue →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
    },
    backButton: {
        padding: Spacing.sm,
        alignSelf: 'flex-start',
        marginLeft: -Spacing.sm,
    },
    backText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '500',
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 120,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    contentContainer: {
        marginBottom: Spacing.xl,
    },
    videoContainer: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        backgroundColor: Colors.background,
    },
    video: {
        width: '100%',
        height: width * 0.56,
    },
    imageContainer: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        backgroundColor: Colors.background,
    },
    image: {
        width: '100%',
        height: width * 0.75,
    },
    textContainer: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textContent: {
        fontSize: FontSizes.md,
        color: Colors.text,
        lineHeight: 26,
    },
    notesSection: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    notesTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    noteItem: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    noteBullet: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        marginRight: Spacing.sm,
    },
    noteText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
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
