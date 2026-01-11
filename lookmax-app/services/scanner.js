import api from './api';

export const scannerService = {
    // Analyze face photo
    async analyzeFace(imageBase64) {
        const response = await api.post('/api/scanner/analyze', {
            imageBase64,
        });
        return response.data;
    },

    // Get scan history
    async getScanHistory() {
        const response = await api.get('/api/scanner/history');
        return response.data;
    },

    // Get specific scan
    async getScan(scanId) {
        const response = await api.get(`/api/scanner/${scanId}`);
        return response.data;
    },

    // Compare two scans
    async compareScans(scanId1, scanId2) {
        const response = await api.get(`/api/scanner/compare/${scanId1}/${scanId2}`);
        return response.data;
    },
};

export default scannerService;
