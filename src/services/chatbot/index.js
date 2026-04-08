import api from '@/services/auth';

export const talkChatbot = async (payload) => {
  try {
    const response = await api.post('/chatbot', payload);
    return await response.data;
  } catch (error) {
    console.error('Error function talkChatbot:', error);
    throw error;
  }
};

export const getReportChatbot = async (fileName) => {
  if (!fileName) {
    throw new Error('File name required to download report');
  }

  try {
    const response = await api.get(
      `/chatbot/download-excel/${encodeURIComponent(fileName)}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error function getReportChatbot:', error);
    throw error;
  }
};
