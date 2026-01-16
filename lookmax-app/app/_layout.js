import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// This component handles the auth-based navigation
function RootLayoutNav() {
    const { isAuthenticated, loading, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!isAuthenticated && !inAuthGroup) {
            // User is not signed in and not on auth screen - redirect to login
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // User is signed in but on auth screen - handle new user flow

            // Check if user has seen feature highlights (new user flow)
            if (!user?.hasSeenFeatureHighlights && !user?.onboarding) {
                router.replace('/(auth)/features');
            } else if (!user?.onboarding) {
                // User hasn't completed onboarding
                router.replace('/(auth)/onboarding');
            } else {
                // Fully onboarded user - go to home
                router.replace('/(tabs)');
            }
        }
    }, [isAuthenticated, loading, segments, user]);

    return (
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
            <Stack.Screen name="index" options={{ headerShown: false }} />
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
            <Stack.Screen
                name="subscription"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="courses"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
