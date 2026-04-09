import api from '@/services/auth';

export const getAttemptsxAgent = async () => {
  try {
    const res = await api.get(`/sqlserver/agents-attempts`);
    return res.data;
  } catch (error) {
    console.error('Error function getAttemptsxAgent:', error);
    throw error;
  }
};
