import { Stack } from 'expo-router';

export default function ModuleLayout() {
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
                }}
            />
            <Stack.Screen
                name="[chapterId]"
                options={{
                    headerShown: true,
                    title: 'Chapter',
                }}
            />
        </Stack>
    );
}
