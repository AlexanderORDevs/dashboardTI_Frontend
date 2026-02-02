import api from '@/services/auth';

export const getAllOwner = async () => {
  try {
    const res = await api.get(`/owner/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllOwner:', error);
    throw error;
  }
};
