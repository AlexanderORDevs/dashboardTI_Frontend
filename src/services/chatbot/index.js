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

export const getChatbotHistory = async () => {
  try {
    const response = await api.get('/chatbot/history');
    return response.data;
  } catch (error) {
    console.error('Error function getChatbotHistory:', error);
    throw error;
  }
};

export const clearChatbotHistory = async () => {
  try {
    const response = await api.delete('/chatbot/history');
    return response.data;
  } catch (error) {
    console.error('Error function clearChatbotHistory:', error);
    throw error;
  }
};

export const getReportChatbot = async (fileSource) => {
  const fileName =
    typeof fileSource === 'string' ? fileSource : fileSource?.fileName;
  const rawFileUrl =
    typeof fileSource === 'object' ? fileSource?.fileUrl || null : null;

  if (!fileName && !rawFileUrl) {
    throw new Error('File name or file URL required to download report');
  }

  try {
    const baseURL = String(api?.defaults?.baseURL || '').toLowerCase();
    const fileUrl = String(rawFileUrl || '').trim();

    let endpoint = `/chatbot/download-excel/${encodeURIComponent(fileName)}`;

    if (fileUrl) {
      if (baseURL.includes('/api') && fileUrl.startsWith('/api/')) {
        endpoint = fileUrl.replace(/^\/api/, '');
      } else {
        endpoint = fileUrl;
      }
    }

    const response = await api.get(endpoint, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error('Error function getReportChatbot:', error);
    throw error;
  }
};
