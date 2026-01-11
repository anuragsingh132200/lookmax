import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';
import api from '../../services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get('/api/users/stats'),
                api.get('/api/scanner/history'),
            ]);
            setStats(statsRes.data);
            setScanHistory(historyRes.data.slice(0, 5));
        } catch (error) {
            console.log('Error loading profile:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0) || 'U'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                {user?.isPremium && (
                    <View style={styles.premiumBadge}>
                        <Ionicons name="diamond" size={14} color="#ffd700" />
                        <Text style={styles.premiumText}>Premium Member</Text>
                    </View>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats?.scanCount || 0}</Text>
                    <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats?.latestScore || '--'}</Text>
                    <Text style={styles.statLabel}>Score</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats?.progressCount || 0}</Text>
                    <Text style={styles.statLabel}>Progress</Text>
                </View>
            </View>

            {/* Stage 01 Baseline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stage 01 Baseline</Text>
                {scanHistory.length > 0 ? (
                    <View style={styles.baselineCard}>
                        <View style={styles.baselineRow}>
                            <Text style={styles.baselineLabel}>Overall Score</Text>
                            <Text style={styles.baselineValue}>
                                {scanHistory[0]?.analysis?.overallScore || '--'}
                            </Text>
                        </View>
                        <View style={styles.baselineRow}>
                            <Text style={styles.baselineLabel}>Canthal Tilt</Text>
                            <Text style={styles.baselineValue}>
                                {scanHistory[0]?.analysis?.canthalTilt || '--'}
                            </Text>
                        </View>
                        <View style={styles.baselineRow}>
                            <Text style={styles.baselineLabel}>Facial Symmetry</Text>
                            <Text style={styles.baselineValue}>
                                {scanHistory[0]?.analysis?.facialSymmetry || '--'}
                            </Text>
                        </View>
                        <View style={styles.baselineRow}>
                            <Text style={styles.baselineLabel}>Jawline</Text>
                            <Text style={styles.baselineValue}>
                                {scanHistory[0]?.analysis?.jawlineDefinition || '--'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyBaseline}>
                        <Ionicons name="camera-outline" size={48} color="#666" />
                        <Text style={styles.emptyText}>Complete your first scan</Text>
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => router.push('/scanner')}
                        >
                            <Text style={styles.scanButtonText}>Start Face Scan</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Scan History */}
            {scanHistory.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Scans</Text>
                    {scanHistory.map((scan) => (
                        <TouchableOpacity key={scan.id} style={styles.historyItem}>
                            <View style={styles.historyIcon}>
                                <Ionicons name="scan" size={20} color="#6c5ce7" />
                            </View>
                            <View style={styles.historyInfo}>
                                <Text style={styles.historyScore}>
                                    Score: {scan.analysis?.overallScore || '--'}
                                </Text>
                                <Text style={styles.historyDate}>
                                    {new Date(scan.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Menu Items */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={22} color="#6c5ce7" />
                    <Text style={styles.menuText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="images-outline" size={22} color="#6c5ce7" />
                    <Text style={styles.menuText}>Progress Photos</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="settings-outline" size={22} color="#6c5ce7" />
                    <Text style={styles.menuText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="help-circle-outline" size={22} color="#6c5ce7" />
                    <Text style={styles.menuText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItemDanger} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
                    <Text style={styles.menuTextDanger}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
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
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userEmail: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
        gap: 6,
    },
    premiumText: {
        color: '#ffd700',
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#2d2d44',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    baselineCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
    },
    baselineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    baselineLabel: {
        color: '#888',
        fontSize: 14,
    },
    baselineValue: {
        color: '#6c5ce7',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyBaseline: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        marginTop: 15,
        marginBottom: 20,
    },
    scanButton: {
        backgroundColor: '#6c5ce7',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    scanButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    historyItem: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyScore: {
        color: '#fff',
        fontWeight: '600',
    },
    historyDate: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuText: {
        color: '#fff',
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
    },
    menuItemDanger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    menuTextDanger: {
        color: '#ff6b6b',
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
    },
});
