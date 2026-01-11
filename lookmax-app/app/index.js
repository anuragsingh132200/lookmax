import { Redirect } from 'expo-router';
import { useAuth } from '../context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    // Check if user needs onboarding
    if (isAuthenticated && user && !user.onboarding) {
        return <Redirect href="/(auth)/onboarding" />;
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f1a',
    },
});
