// Ekspor individual functions
export const BASE_URL = 'http://localhost:8000/api';

export const setToken = (token, remember = false) => {
    if (remember) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
};

export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const removeToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Export default object yang berisi semua fungsi (opsional)
const utils = {
    BASE_URL,
    setToken,
    getToken,
    removeToken,
    getUser
};

export default utils;