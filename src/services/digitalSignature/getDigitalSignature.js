import api from '@/services/auth';

export const getDigitalSignature = async () => {
  try {
    const res = await api.get(`/mediaFiles/all`);
    return res.data;
  } catch (error) {
    console.error('Error function getDigitalSignature:', error);
    throw error;
  }
};

export const getDigitalSignatureById = async (id) => {
  try {
    const res = await api.get(`/mediaFiles/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error function getDigitalSignatureById (id: ${id}):`, error);
    throw error;
  }
};
