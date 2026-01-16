import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function ScanLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="scanner" />
            <Stack.Screen name="results" />
            <Stack.Screen name="subscribe" />
        </Stack>
    );
}
