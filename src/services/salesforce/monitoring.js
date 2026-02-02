import api from '@/services/auth';

export const monitoringAttemps = async () => {
  try {
    const res = await api.get(`/salesforce/attempts/report`);
    return res.data;
  } catch (error) {
    console.error('Error function monitoringAttemps:', error);
    throw error;
  }
};
