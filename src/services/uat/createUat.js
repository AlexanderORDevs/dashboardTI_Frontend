import api from '@/services/auth';

export const saveRegister = async (payload) => {
  try {
    let endpoint = '/uat/landingCreate';

    if (payload.uatType === 'did_select') {
      endpoint = '/uat/didCreate';
    }
    const response = await api.post(endpoint, payload);

    return await response.data;
  } catch (error) {
    console.error('Error function saveRegister:', error);
    throw error;
  }
};
