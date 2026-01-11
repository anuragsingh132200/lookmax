import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
    {
        icon: 'scan',
        title: 'Unlimited Face Scans',
        description: 'Analyze your face as often as you want',
    },
    {
        icon: 'book',
        title: 'Full Course Library',
        description: 'Access all skincare, hair, and fitness courses',
    },
    {
        icon: 'videocam',
        title: '1:1 Live Coaching',
        description: 'Book sessions with expert coaches',
    },
    {
        icon: 'analytics',
        title: 'Advanced Analytics',
        description: 'Track your progress with detailed metrics',
    },
    {
        icon: 'people',
        title: 'Premium Community',
        description: 'Access exclusive forums and chat rooms',
    },
    {
        icon: 'calendar',
        title: 'Priority Events',
        description: 'First access to workshops and talks',
    },
];

const PLANS = [
    {
        id: 'weekly',
        name: 'Weekly',
        price: '$4.99',
        period: '/week',
        savings: null,
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '$9.99',
        period: '/month',
        savings: 'Save 50%',
        popular: true,
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '$49.99',
        period: '/year',
        savings: 'Save 80%',
    },
];

export default function PaywallScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = React.useState('monthly');

    const handleSubscribe = () => {
        // In a real app, this would handle payment processing
        alert('Payment integration coming soon!');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.iconContainer}>
                    <Ionicons name="diamond" size={48} color="#ffd700" />
                </View>

                <Text style={styles.title}>Unlock Premium</Text>
                <Text style={styles.subtitle}>
                    Get full access to your personalized glow-up journey
                </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
                {FEATURES.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name={feature.icon} size={24} color="#6c5ce7" />
                        </View>
                        <View style={styles.featureText}>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Plans */}
            <View style={styles.plansSection}>
                <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                {PLANS.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[
                            styles.planCard,
                            selectedPlan === plan.id && styles.planCardSelected,
                        ]}
                        onPress={() => setSelectedPlan(plan.id)}
                    >
                        <View style={styles.planInfo}>
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{plan.name}</Text>
                                {plan.popular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularText}>POPULAR</Text>
                                    </View>
                                )}
                            </View>
                            {plan.savings && (
                                <Text style={styles.planSavings}>{plan.savings}</Text>
                            )}
                        </View>
                        <View style={styles.planPrice}>
                            <Text style={styles.priceAmount}>{plan.price}</Text>
                            <Text style={styles.pricePeriod}>{plan.period}</Text>
                        </View>
                        <View style={[
                            styles.radioButton,
                            selectedPlan === plan.id && styles.radioButtonSelected,
                        ]}>
                            {selectedPlan === plan.id && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                <Text style={styles.subscribeButtonText}>Start Premium</Text>
            </TouchableOpacity>

            {/* Terms */}
            <View style={styles.terms}>
                <Text style={styles.termsText}>
                    Cancel anytime. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
                </Text>
                <View style={styles.termsLinks}>
                    <TouchableOpacity>
                        <Text style={styles.termsLink}>Terms of Service</Text>
                    </TouchableOpacity>
                    <Text style={styles.termsDot}>•</Text>
                    <TouchableOpacity>
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    header: {
        alignItems: 'center',
        padding: 30,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    featureDescription: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    plansSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    planCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    planCardSelected: {
        borderColor: '#6c5ce7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
    },
    planInfo: {
        flex: 1,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    planName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    popularBadge: {
        backgroundColor: '#6c5ce7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    popularText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    planSavings: {
        color: '#00c853',
        fontSize: 13,
        marginTop: 4,
    },
    planPrice: {
        alignItems: 'flex-end',
        marginRight: 15,
    },
    priceAmount: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    pricePeriod: {
        color: '#888',
        fontSize: 13,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#6c5ce7',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6c5ce7',
    },
    subscribeButton: {
        backgroundColor: '#6c5ce7',
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    terms: {
        padding: 20,
        alignItems: 'center',
    },
    termsText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        gap: 10,
    },
    termsLink: {
        color: '#6c5ce7',
        fontSize: 12,
    },
    termsDot: {
        color: '#666',
    },
});
