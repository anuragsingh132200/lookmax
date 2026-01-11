import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { scannerService } from '../../services';

export default function ScannerScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('front');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 0.7,
                });
                setCapturedImage(photo);
            } catch (error) {
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0]);
        }
    };

    const analyzeFace = async () => {
        if (!capturedImage?.base64) return;

        setAnalyzing(true);
        try {
            const result = await scannerService.analyzeFace(capturedImage.base64);
            setResults(result.analysis);
        } catch (error) {
            Alert.alert('Error', 'Failed to analyze face. Please try again.');
            console.log('Analysis error:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const resetScan = () => {
        setCapturedImage(null);
        setResults(null);
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={80} color="#6c5ce7" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to analyze your face and provide personalized recommendations.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadButtonText}>Or Upload from Gallery</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show results
    if (results) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.resultsContainer}>
                    {/* Score Header */}
                    <View style={styles.scoreHeader}>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreNumber}>{results.overallScore || '--'}</Text>
                            <Text style={styles.scoreLabel}>Score</Text>
                        </View>
                    </View>

                    {/* Key Metrics */}
                    <View style={styles.metricsSection}>
                        <Text style={styles.sectionTitle}>Analysis Results</Text>
                        <View style={styles.metricCard}>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>Canthal Tilt</Text>
                                <Text style={styles.metricValue}>{results.canthalTilt || 'N/A'}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>Facial Symmetry</Text>
                                <Text style={styles.metricValue}>{results.facialSymmetry || 'N/A'}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>Jawline Definition</Text>
                                <Text style={styles.metricValue}>{results.jawlineDefinition || 'N/A'}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>Skin Quality</Text>
                                <Text style={styles.metricValue}>{results.skinQuality || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Detailed Measurements */}
                    {results.measurements?.length > 0 && (
                        <View style={styles.metricsSection}>
                            <Text style={styles.sectionTitle}>Detailed Measurements</Text>
                            {results.measurements.map((measurement, index) => (
                                <View key={index} style={styles.measurementCard}>
                                    <View style={styles.measurementHeader}>
                                        <Text style={styles.measurementName}>{measurement.name}</Text>
                                        <View style={[
                                            styles.ratingBadge,
                                            measurement.rating === 'good' && styles.ratingGood,
                                            measurement.rating === 'needs_improvement' && styles.ratingNeedsWork,
                                        ]}>
                                            <Text style={styles.ratingText}>{measurement.rating}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.measurementValue}>{measurement.value}</Text>
                                    {measurement.description && (
                                        <Text style={styles.measurementDesc}>{measurement.description}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recommendations */}
                    {results.recommendations?.length > 0 && (
                        <View style={styles.metricsSection}>
                            <Text style={styles.sectionTitle}>Recommendations</Text>
                            {results.recommendations.map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
                                    <Text style={styles.recommendationText}>{rec}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Protocols */}
                    {results.protocols?.length > 0 && (
                        <View style={styles.metricsSection}>
                            <Text style={styles.sectionTitle}>Your Protocols</Text>
                            {results.protocols.map((protocol, index) => (
                                <View key={index} style={styles.protocolItem}>
                                    <Text style={styles.protocolNumber}>{index + 1}</Text>
                                    <Text style={styles.protocolText}>{protocol}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.resultActions}>
                        <TouchableOpacity style={styles.newScanButton} onPress={resetScan}>
                            <Ionicons name="camera" size={20} color="#fff" />
                            <Text style={styles.newScanButtonText}>New Scan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={styles.homeButtonText}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // Show captured image
    if (capturedImage) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />

                {analyzing ? (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color="#6c5ce7" />
                        <Text style={styles.analyzingText}>Analyzing your face...</Text>
                        <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
                    </View>
                ) : (
                    <View style={styles.previewActions}>
                        <TouchableOpacity style={styles.retakeButton} onPress={resetScan}>
                            <Ionicons name="refresh" size={24} color="#fff" />
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeFace}>
                            <Ionicons name="scan" size={24} color="#fff" />
                            <Text style={styles.analyzeButtonText}>Analyze</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    // Camera view
    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
            >
                {/* Guide overlay */}
                <View style={styles.guideOverlay}>
                    <View style={styles.faceGuide} />
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                    <Text style={styles.instructionText}>
                        Position your face within the guide
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                        <Ionicons name="images" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                    >
                        <Ionicons name="camera-reverse" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    camera: {
        flex: 1,
    },
    guideOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    faceGuide: {
        width: 280,
        height: 380,
        borderRadius: 140,
        borderWidth: 3,
        borderColor: 'rgba(108, 92, 231, 0.6)',
        borderStyle: 'dashed',
    },
    instructions: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#fff',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    permissionText: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    permissionButton: {
        backgroundColor: '#6c5ce7',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        marginBottom: 15,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    uploadButton: {
        paddingVertical: 10,
    },
    uploadButtonText: {
        color: '#6c5ce7',
        fontSize: 16,
    },
    previewImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    previewActions: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    retakeButton: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    retakeButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    analyzeButton: {
        flex: 1,
        backgroundColor: '#6c5ce7',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    analyzeButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 15, 26, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    analyzingSubtext: {
        color: '#888',
        marginTop: 8,
    },
    resultsContainer: {
        padding: 20,
    },
    scoreHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    scoreCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreNumber: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    metricsSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    metricCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    metricLabel: {
        color: '#888',
        fontSize: 14,
    },
    metricValue: {
        color: '#6c5ce7',
        fontWeight: '600',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    measurementCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    measurementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    measurementName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    ratingBadge: {
        backgroundColor: '#2d2d44',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingGood: {
        backgroundColor: 'rgba(0, 200, 100, 0.2)',
    },
    ratingNeedsWork: {
        backgroundColor: 'rgba(255, 100, 100, 0.2)',
    },
    ratingText: {
        color: '#888',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    measurementValue: {
        color: '#6c5ce7',
        fontSize: 14,
    },
    measurementDesc: {
        color: '#888',
        fontSize: 13,
        marginTop: 6,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        gap: 12,
    },
    recommendationText: {
        color: '#ddd',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    protocolItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        gap: 12,
    },
    protocolNumber: {
        color: '#6c5ce7',
        fontWeight: 'bold',
        fontSize: 16,
    },
    protocolText: {
        color: '#ddd',
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    resultActions: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20,
        marginBottom: 40,
    },
    newScanButton: {
        flex: 1,
        backgroundColor: '#6c5ce7',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    newScanButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    homeButton: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
