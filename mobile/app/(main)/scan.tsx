import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function ScanTabScreen() {
    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.icon}>📷</Text>
                <Text style={styles.title}>Face Scanner</Text>
                <Text style={styles.subtitle}>
                    Get an AI-powered analysis of your facial features
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(scan)/scanner')}
                >
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Start New Scan</Text>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    icon: {
        fontSize: 80,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    button: {
        width: '100%',
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
