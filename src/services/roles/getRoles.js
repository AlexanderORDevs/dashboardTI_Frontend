import api from '@/services/auth';

export const getAllRoles = async () => {
  try {
    const res = await api.get(`/roles/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllRoles:', error);
    throw error;
  }
};
