import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../../constants/theme';

export default function MainLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.iconContainer}>
                            <TabIcon icon="🏠" color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="courses"
                options={{
                    title: 'Courses',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.iconContainer}>
                            <TabIcon icon="📚" color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.iconContainer}>
                            <TabIcon icon="📷" color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.iconContainer}>
                            <TabIcon icon="📈" color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.iconContainer}>
                            <TabIcon icon="👤" color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
    return (
        <View style={[styles.icon, { opacity: color === Colors.primary ? 1 : 0.6 }]}>
            <View style={styles.iconText}>
                <View><TabIconText icon={icon} /></View>
            </View>
        </View>
    );
}

function TabIconText({ icon }: { icon: string }) {
    const Text = require('react-native').Text;
    return <Text style={{ fontSize: 22 }}>{icon}</Text>;
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 80,
        paddingTop: 8,
        paddingBottom: 20,
    },
    tabLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '500',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
