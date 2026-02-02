import api from '@/services/auth';

export const getAllProducts = async () => {
  try {
    const res = await api.get(`/products/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllProducts:', error);
    throw error;
  }
};
