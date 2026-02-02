import api from '@/services/auth';

export const getAllDomains = async () => {
  try {
    const res = await api.get(`/domains/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getAllDomains:', error);
    throw error;
  }
};
