import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const features = [
    { icon: '🔓', text: 'Unlock your full face analysis results' },
    { icon: '📊', text: 'Detailed scores for each facial category' },
    { icon: '💡', text: 'Personalized improvement recommendations' },
    { icon: '🎓', text: 'Access to the complete GlowUp Guide' },
    { icon: '📈', text: 'Track your progress over time' },
    { icon: '♻️', text: 'Unlimited face scans' },
];

export default function SubscribeScreen() {
    const handleSubscribe = () => {
        router.push('/payment/checkout');
    };

    const handleMaybeLater = () => {
        router.replace('/(main)/home');
    };

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.crown}>👑</Text>
                    <Text style={styles.title}>Unlock Premium</Text>
                    <Text style={styles.subtitle}>
                        Get full access to your analysis and start your transformation
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresCard}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Pricing */}
                <View style={styles.pricingCard}>
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        style={styles.pricingGradient}
                    >
                        <View style={styles.pricingBadge}>
                            <Text style={styles.badgeText}>BEST VALUE</Text>
                        </View>
                        <Text style={styles.pricingLabel}>Premium Access</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.price}>9</Text>
                            <Text style={styles.cents}>.99</Text>
                            <Text style={styles.period}>/month</Text>
                        </View>
                        <Text style={styles.pricingNote}>Cancel anytime</Text>
                    </LinearGradient>
                </View>

                {/* Guarantee */}
                <View style={styles.guarantee}>
                    <Text style={styles.guaranteeIcon}>🛡️</Text>
                    <Text style={styles.guaranteeText}>
                        30-day money-back guarantee. No questions asked.
                    </Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
                    <LinearGradient
                        colors={Colors.gradientSecondary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Subscribe Now</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleMaybeLater}>
                    <Text style={styles.skipText}>Maybe Later</Text>
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
        padding: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 140,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    crown: {
        fontSize: 56,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: Spacing.md,
    },
    featureText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.text,
        lineHeight: 22,
    },
    pricingCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    pricingGradient: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    pricingBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.md,
    },
    badgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: Colors.background,
    },
    pricingLabel: {
        fontSize: FontSizes.lg,
        color: Colors.text,
        opacity: 0.9,
        marginBottom: Spacing.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    currency: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 8,
    },
    price: {
        fontSize: 56,
        fontWeight: '800',
        color: Colors.text,
    },
    cents: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 8,
    },
    period: {
        fontSize: FontSizes.md,
        color: Colors.text,
        opacity: 0.8,
        marginTop: 24,
        marginLeft: Spacing.xs,
    },
    pricingNote: {
        fontSize: FontSizes.sm,
        color: Colors.text,
        opacity: 0.7,
        marginTop: Spacing.md,
    },
    guarantee: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    guaranteeIcon: {
        fontSize: 20,
    },
    guaranteeText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
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
    skipButton: {
        padding: Spacing.md,
        alignItems: 'center',
    },
    skipText: {
        fontSize: FontSizes.md,
        color: Colors.textMuted,
    },
});
