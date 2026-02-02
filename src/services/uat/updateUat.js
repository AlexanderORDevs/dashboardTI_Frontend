import api from '@/services/auth';

export const updatedRegister = async (payload) => {
  try {
    let endpoint = '/uat/landingUpdate';
    if (payload.uatType === 'did_select') {
      endpoint = '/uat/didUpdate';
    }
    const { id, ...dataToUpdate } = payload;
    const url = `${endpoint}/${id}`;

    const response = await api.put(url, dataToUpdate);
    return await response.data;
  } catch (error) {
    console.error('Error function updatedRegister:', error);
    throw error;
  }
};
