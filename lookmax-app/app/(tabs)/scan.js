import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// This is a placeholder screen - the actual scanner is opened via the + button
export default function ScanTabScreen() {
    const router = useRouter();

    React.useEffect(() => {
        router.push('/scanner');
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Opening Scanner...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 18,
    },
});
