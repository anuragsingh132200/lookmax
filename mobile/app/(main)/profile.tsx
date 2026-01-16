import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useUserStore } from '../../stores/userStore';

export default function ProfileScreen() {
    const { user, logout, isSubscribed } = useUserStore();

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to logout?')) {
                await logout();
                router.replace('/(auth)/login');
            }
            return;
        }

        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const subscribed = isSubscribed();

    return (
        <LinearGradient
            colors={[Colors.background, Colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    {subscribed && (
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>👑 Premium Member</Text>
                        </View>
                    )}
                </View>

                {/* Subscription Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription</Text>
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardLabel}>Status</Text>
                            <Text style={[styles.cardValue, subscribed && styles.activeStatus]}>
                                {subscribed ? 'Active' : 'Free'}
                            </Text>
                        </View>
                        {!subscribed && (
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={() => router.push('/(scan)/subscribe')}
                            >
                                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Profile Info */}
                {user?.onboarding && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Profile</Text>
                        <View style={styles.card}>
                            {user.onboarding.gender && (
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Gender</Text>
                                    <Text style={styles.cardValue}>
                                        {user.onboarding.gender.charAt(0).toUpperCase() +
                                            user.onboarding.gender.slice(1)}
                                    </Text>
                                </View>
                            )}
                            {user.onboarding.skinType && (
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Skin Type</Text>
                                    <Text style={styles.cardValue}>
                                        {user.onboarding.skinType.charAt(0).toUpperCase() +
                                            user.onboarding.skinType.slice(1)}
                                    </Text>
                                </View>
                            )}
                            {user.onboarding.goals && user.onboarding.goals.length > 0 && (
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Goals</Text>
                                    <Text style={styles.cardValue}>
                                        {user.onboarding.goals.length} selected
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>🔔</Text>
                            <Text style={styles.menuText}>Notifications</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>🔒</Text>
                            <Text style={styles.menuText}>Privacy</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>❓</Text>
                            <Text style={styles.menuText}>Help & Support</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuIcon}>📄</Text>
                            <Text style={styles.menuText}>Terms of Service</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>LookMax v1.0.0</Text>
            </ScrollView>
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
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
    },
    name: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    email: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    premiumBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    premiumText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.background,
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
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cardLabel: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    cardValue: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontWeight: '500',
    },
    activeStatus: {
        color: Colors.success,
    },
    upgradeButton: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    upgradeText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: Spacing.md,
    },
    menuText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.text,
    },
    menuArrow: {
        fontSize: FontSizes.lg,
        color: Colors.textMuted,
    },
    logoutButton: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.error,
        marginBottom: Spacing.lg,
    },
    logoutText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.error,
    },
    version: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});
