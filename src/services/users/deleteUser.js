import api from '@/services/auth';

export const deleteUsers = async (payload) => {
  try {
    const { id } = payload;
    const url = `/users/delete/${id}`;

    const response = await api.delete(url);
    return await response.data;
  } catch (error) {
    console.error('Error function deleteUsers:', error);
    throw error;
  }
};
