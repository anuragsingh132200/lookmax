import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';
import api from '../../services/api';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [glowUpPlan, setGlowUpPlan] = useState(null);
    const [events, setEvents] = useState([]);
    const [progress, setProgress] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const isPremium = user?.isPremium || user?.subscriptionStatus === 'active';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const requests = [
                api.get('/api/users/stats'),
                api.get('/api/content/glow-up-plan'),
                api.get('/api/events'),
            ];

            // Only fetch progress if user is premium
            if (isPremium) {
                requests.push(api.get('/api/progress/user'));
            }

            const responses = await Promise.all(requests);
            setStats(responses[0].data);
            setGlowUpPlan(responses[1].data);
            setEvents(responses[2].data.slice(0, 3));

            if (isPremium && responses[3]) {
                setProgress(responses[3].data);
            }
        } catch (error) {
            console.log('Error loading home data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}!</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Ionicons name="camera" size={24} color="#6c5ce7" />
                    <Text style={styles.statNumber}>{stats?.scanCount || 0}</Text>
                    <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={[styles.statCard, styles.statCardHighlight]}>
                    <Ionicons name="trending-up" size={24} color="#fff" />
                    <Text style={[styles.statNumber, styles.statNumberHighlight]}>
                        {stats?.latestScore || '--'}
                    </Text>
                    <Text style={[styles.statLabel, styles.statLabelHighlight]}>Score</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="images" size={24} color="#6c5ce7" />
                    <Text style={styles.statNumber}>{stats?.progressCount || 0}</Text>
                    <Text style={styles.statLabel}>Progress</Text>
                </View>
            </View>

            {/* Course Progress - Premium Users */}
            {isPremium && progress && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Glow-Up Journey</Text>
                        <TouchableOpacity onPress={() => router.push('/courses')}>
                            <Text style={styles.sectionLink}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.progressCard}
                        onPress={() => router.push('/courses')}
                    >
                        <View style={styles.progressHeader}>
                            <Ionicons name="trophy" size={24} color="#ffd700" />
                            <Text style={styles.progressTitle}>Course Progress</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress.overallPercentage || 0}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {progress.totalCompleted || 0} of {progress.totalChapters || 0} completed
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => router.push('/scanner')}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="scan" size={28} color="#6c5ce7" />
                        </View>
                        <Text style={styles.quickActionText}>Face Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => router.push('/(tabs)/forum')}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="people" size={28} color="#6c5ce7" />
                        </View>
                        <Text style={styles.quickActionText}>Community</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => isPremium ? router.push('/courses') : router.push('/subscription')}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="book" size={28} color="#6c5ce7" />
                        </View>
                        <Text style={styles.quickActionText}>Courses</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Glow-Up Plan */}
            {glowUpPlan?.hasData && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Glow-Up Plan</Text>
                    <View style={styles.planCard}>
                        <View style={styles.planHeader}>
                            <Text style={styles.planScore}>Score: {glowUpPlan.overallScore}</Text>
                            <TouchableOpacity>
                                <Text style={styles.planViewAll}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        {glowUpPlan.recommendations?.slice(0, 3).map((rec, index) => (
                            <View key={index} style={styles.planItem}>
                                <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
                                <Text style={styles.planItemText}>{rec}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {events.map((event) => (
                        <TouchableOpacity key={event.id} style={styles.eventCard}>
                            <View style={styles.eventIcon}>
                                <Ionicons
                                    name={event.type === 'coaching' ? 'videocam' : 'calendar'}
                                    size={24}
                                    color="#6c5ce7"
                                />
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>
                                    {new Date(event.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Premium Banner - Non Premium Users */}
            {!isPremium && (
                <TouchableOpacity
                    style={styles.premiumBanner}
                    onPress={() => router.push('/subscription')}
                >
                    <View style={styles.premiumContent}>
                        <Ionicons name="diamond" size={32} color="#ffd700" />
                        <View style={styles.premiumText}>
                            <Text style={styles.premiumTitle}>Unlock Premium</Text>
                            <Text style={styles.premiumDesc}>
                                Get full access to all courses and features
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    welcomeSection: {
        padding: 20,
        paddingTop: 10,
    },
    welcomeText: {
        fontSize: 16,
        color: '#888',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
    },
    statCardHighlight: {
        backgroundColor: '#6c5ce7',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    statNumberHighlight: {
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statLabelHighlight: {
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    sectionLink: {
        color: '#6c5ce7',
        fontSize: 14,
    },
    progressCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    progressTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2d2d44',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6c5ce7',
        borderRadius: 4,
    },
    progressText: {
        color: '#888',
        fontSize: 14,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAction: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        color: '#888',
        fontSize: 12,
    },
    planCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    planScore: {
        color: '#6c5ce7',
        fontWeight: 'bold',
        fontSize: 16,
    },
    planViewAll: {
        color: '#6c5ce7',
        fontSize: 14,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    planItemText: {
        color: '#ddd',
        flex: 1,
        fontSize: 14,
    },
    eventCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    eventIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    eventDate: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    premiumBanner: {
        backgroundColor: '#6c5ce7',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 15,
    },
    premiumText: {
        flex: 1,
    },
    premiumTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    premiumDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
});
