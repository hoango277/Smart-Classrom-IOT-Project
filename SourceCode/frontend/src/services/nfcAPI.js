import axiosInstance from '../config/axios.js';

export const nfcAPI = {
    registerCard: (data) => axiosInstance.post('/nfc/cards', data),
    getCards: () => axiosInstance.get('/nfc/cards'),
    deleteCard: (cardId) => axiosInstance.delete(`/nfc/cards/${cardId}`),
    getSyncData: () => axiosInstance.get('/nfc/cards/sync-data'),

    // Access logs (attendance)
    logScan: (data) => axiosInstance.post('/access-logs', data),
    getLogs: (date) => axiosInstance.get('/access-logs', { params: { date } }),
};

export default nfcAPI;
