import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context';

// This is just a loading screen - actual navigation is handled by _layout.js
export default function Index() {
    const { loading } = useAuth();

    // Show loading while checking auth state
    // The RootLayoutNav in _layout.js will handle redirecting
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#6c5ce7" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f1a',
    },
});
