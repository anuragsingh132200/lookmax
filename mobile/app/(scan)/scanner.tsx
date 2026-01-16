import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { scanApi } from '../../services/api';
import { useUserStore } from '../../stores/userStore';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const cameraRef = useRef<any>(null);
    const { updateUser } = useUserStore();

    const takePicture = async () => {
        if (!cameraRef.current || isAnalyzing) return;

        setIsAnalyzing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.8,
            });

            await analyzeImage(photo.base64);
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo. Please try again.');
            setIsAnalyzing(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setIsAnalyzing(true);
                await analyzeImage(result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const analyzeImage = async (base64: string) => {
        try {
            const response = await scanApi.analyze(base64);
            updateUser({ hasCompletedFirstScan: true });

            router.replace({
                pathname: '/(scan)/results',
                params: { scanId: response.data.id },
            });
        } catch (error: any) {
            Alert.alert(
                'Analysis Failed',
                error.response?.data?.detail || 'Unable to analyze image. Please try again.'
            );
            setIsAnalyzing(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <LinearGradient
                colors={[Colors.background, Colors.backgroundSecondary]}
                style={styles.container}
            >
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionIcon}>📸</Text>
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to analyze your face and provide personalized recommendations.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Grant Access</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Text style={styles.galleryButtonText}>Or pick from gallery</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Face Scan</Text>
                        <Text style={styles.subtitle}>Center your face in the frame</Text>
                    </View>

                    {/* Face Guide */}
                    <View style={styles.faceGuide}>
                        <View style={styles.faceOval} />
                    </View>

                    {/* Instructions */}
                    <View style={styles.instructions}>
                        <Text style={styles.instructionText}>✓ Good lighting</Text>
                        <Text style={styles.instructionText}>✓ Face forward</Text>
                        <Text style={styles.instructionText}>✓ Neutral expression</Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.galleryIcon} onPress={pickImage}>
                            <Text style={styles.iconText}>🖼️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <ActivityIndicator size="large" color={Colors.text} />
                            ) : (
                                <View style={styles.captureInner} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.flipButton}
                            onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
                        >
                            <Text style={styles.iconText}>🔄</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Analyzing Overlay */}
                {isAnalyzing && (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.analyzingText}>Analyzing your features...</Text>
                        <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
                    </View>
                )}
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    faceGuide: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    faceOval: {
        width: width * 0.65,
        height: width * 0.85,
        borderRadius: width * 0.325,
        borderWidth: 3,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    instructions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    instructionText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        backgroundColor: Colors.overlay,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    galleryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 24,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.text,
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.text,
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
        marginTop: Spacing.lg,
    },
    analyzingSubtext: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    permissionTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 24,
    },
    permissionButton: {
        width: '100%',
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: Spacing.md,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    galleryButton: {
        marginTop: Spacing.lg,
        padding: Spacing.md,
    },
    galleryButtonText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
    },
});
