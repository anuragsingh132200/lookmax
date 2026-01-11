import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function QuickActionButton() {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/scanner')}
        >
            <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
    );
}

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#1a1a2e',
                    borderTopColor: '#2d2d44',
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom + 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#6c5ce7',
                tabBarInactiveTintColor: '#666',
                headerStyle: {
                    backgroundColor: '#1a1a2e',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'LookMax',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: '',
                    tabBarIcon: () => <QuickActionButton />,
                    tabBarButton: (props) => (
                        <View style={styles.quickActionContainer}>
                            <TouchableOpacity {...props} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="forum"
                options={{
                    title: 'Forum',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="globe" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    quickActionContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        shadowColor: '#6c5ce7',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});

