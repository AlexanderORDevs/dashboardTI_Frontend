import api from '@/services/auth';

export const casesAssignments = async () => {
  try {
    const res = await api.get(`/assign/cases`);
    return res.data;
  } catch (error) {
    console.error('Error function casesAssignments:', error);
    throw error;
  }
};
