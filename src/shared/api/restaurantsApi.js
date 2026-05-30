import api from './axiosInstance.js';

export const getRestaurants = () => api.get('/restaurants');
export const searchRestaurants = (query) =>
    api.get('/restaurants', { params: { search: query } });