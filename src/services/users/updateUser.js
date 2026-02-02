import api from '@/services/auth';

export const updateUsers = async (payload) => {
  try {
    const { id, ...dataToUpdateUser } = payload;
    const url = `/users/update/${id}`;

    const response = await api.put(url, dataToUpdateUser);
    return await response.data;
  } catch (error) {
    console.error('Error function updateUsers:', error);
    throw error;
  }
};
