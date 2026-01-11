import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context';

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1a1a2e',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: '#0f0f1a',
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="scanner"
                    options={{
                        headerShown: true,
                        title: 'Face Scanner',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="paywall"
                    options={{
                        headerShown: true,
                        title: 'Premium',
                        presentation: 'modal',
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
