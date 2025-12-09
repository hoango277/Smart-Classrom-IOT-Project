import axiosInstance from '../config/axios';

/**
 * Environment Data API Service
 * Handles all environment data operations with backend
 */
export const environmentAPI = {
    /**
     * Save single environment data point
     * @param {number} temperature - Temperature in Celsius
     * @param {number} humidity - Humidity in percentage
     * @returns {Promise<Object>} Response with status and id
     */
    saveData: async (temperature, humidity) => {
        return axiosInstance.post('/environment/data', {
            temperature,
            humidity
        });
    },

    /**
     * Batch save multiple environment data points
     * @param {Array<{temperature: number, humidity: number}>} dataArray - Array of data points
     * @returns {Promise<Object>} Response with status and count
     */
    saveBatch: async (dataArray) => {
        return axiosInstance.post('/environment/data/batch', dataArray);
    },

    /**
     * Get environment history with optional filters
     * @param {string} fromDate - ISO date string (optional)
     * @param {string} toDate - ISO date string (optional)
     * @param {number} limit - Maximum number of records (default: 1000)
     * @returns {Promise<Array>} Array of environment data
     */
    getHistory: async (fromDate, toDate, limit = 1000) => {
        return axiosInstance.get('/environment/history', {
            params: {
                from_date: fromDate,
                to_date: toDate,
                limit
            }
        });
    },

    /**
     * Get latest environment data
     * @returns {Promise<Object>} Latest environment data
     */
    getLatest: async () => {
        return axiosInstance.get('/environment/latest');
    },

    /**
     * Get environment statistics
     * @param {string} fromDate - ISO date string (optional)
     * @param {string} toDate - ISO date string (optional)
     * @returns {Promise<Object>} Statistics (min, max, avg)
     */
    getStats: async (fromDate, toDate) => {
        return axiosInstance.get('/environment/stats', {
            params: {
                from_date: fromDate,
                to_date: toDate
            }
        });
    }
};

export default environmentAPI;
