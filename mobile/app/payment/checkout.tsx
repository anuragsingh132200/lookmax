import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { paymentApi } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

export default function CheckoutScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const { loadUser } = useUserStore();

    useEffect(() => {
        initPayment();
    }, []);

    const initPayment = async () => {
        setIsLoading(true);
        try {
            const response = await paymentApi.createPaymentIntent();
            setPaymentData(response.data);
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to initialize payment. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        // In a real app, you would use Stripe's confirmPayment here
        // For demo purposes, we'll simulate a successful payment
        setIsLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify payment (in real app, this would be after actual payment)
            if (paymentData?.paymentIntentId) {
                await paymentApi.verifyPayment(paymentData.paymentIntentId);
            }

            // Reload user to get updated subscription
            await loadUser();

            Alert.alert(
                'Payment Successful! 🎉',
                'Welcome to LookMax Premium! You now have full access to all features.',
                [
                    {
                        text: 'Start My GlowUp',
                        onPress: () => router.replace('/(main)/home'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Payment Failed',
                error.response?.data?.detail || 'Payment could not be processed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                    <Text style={styles.backText}>← Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Order Summary */}
                <View style={styles.orderCard}>
                    <Text style={styles.orderTitle}>Order Summary</Text>

                    <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>LookMax Premium</Text>
                        <Text style={styles.orderValue}>$9.99/mo</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.features}>
                        <Text style={styles.featureItem}>✓ Full face analysis results</Text>
                        <Text style={styles.featureItem}>✓ Complete GlowUp Guide access</Text>
                        <Text style={styles.featureItem}>✓ Unlimited scans</Text>
                        <Text style={styles.featureItem}>✓ Progress tracking</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.orderRow}>
                        <Text style={styles.totalLabel}>Total Today</Text>
                        <Text style={styles.totalValue}>$9.99</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentTitle}>Payment Method</Text>
                    <View style={styles.cardInput}>
                        <Text style={styles.cardPlaceholder}>
                            💳 Card ending in •••• 4242
                        </Text>
                    </View>
                    <Text style={styles.paymentNote}>
                        Demo mode - no real payment will be processed
                    </Text>
                </View>

                {/* Security */}
                <View style={styles.security}>
                    <Text style={styles.securityIcon}>🔒</Text>
                    <Text style={styles.securityText}>
                        Secured with Stripe. Your payment info is never stored.
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handlePayment}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={Colors.gradientSecondary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.text} />
                        ) : (
                            <Text style={styles.buttonText}>Pay $9.99</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.terms}>
                    By subscribing, you agree to our Terms of Service
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    backButton: {
        padding: Spacing.sm,
    },
    backText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.text,
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    orderCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    orderTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
    },
    orderValue: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    features: {
        gap: Spacing.xs,
    },
    featureItem: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    totalLabel: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    totalValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    paymentCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    paymentTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    cardInput: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardPlaceholder: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    paymentNote: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    security: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    securityIcon: {
        fontSize: 16,
    },
    securityText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    footer: {
        padding: Spacing.lg,
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
    terms: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.md,
    },
});
