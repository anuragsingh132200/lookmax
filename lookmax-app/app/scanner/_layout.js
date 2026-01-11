import { Stack } from 'expo-router';

export default function ScannerLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1a1a2e',
                },
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Face Scanner',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
