import { Stack } from 'expo-router';

export default function SubscriptionLayout() {
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
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: 'Premium',
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}
