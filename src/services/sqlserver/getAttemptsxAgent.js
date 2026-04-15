import api from '@/services/auth';

export const getAttemptsxAgent = async (date) => {
  try {
    const res = await api.get(`/sqlserver/agents-attempts`, {
      params: { date },
    });
    return res.data;
  } catch (error) {
    console.error('Error function getAttemptsxAgent:', error);
    throw error;
  }
};

export const downloadAttemptsxAgent = async (date) => {
  try {
    const res = await api.get(`/sqlserver/download-agents-attempts`, {
      params: { date },
    });
    return res.data;
  } catch (error) {
    console.error('Error function downloadAttemptsxAgent:', error);
    throw error;
  }
};
