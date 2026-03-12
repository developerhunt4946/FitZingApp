import apiClient from './apiClient';

// ==============================
// Create Payment Order
// ==============================
export const createPaymentOrder = async (payload) => {
    try {
        const response = await apiClient.post('/payments/create-order', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==============================
// Verify Payment
// ==============================
export const verifyPayment = async (orderId) => {
    try {
        const response = await apiClient.post('/payments/verify-payment', { orderId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
