import api from '@/services/auth';

export const getInboundNotifications = async (sinceId = 0, limit = 100) => {
  try {
    const res = await api.get('/infobit/notifications/inbound', {
      params: { sinceId, limit },
    });
    return res.data;
  } catch (error) {
    console.error('Error function getInboundNotifications:', error);
    throw error;
  }
};
