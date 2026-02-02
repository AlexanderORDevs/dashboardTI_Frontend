import api from '@/services/auth';

export const getUatRecords = async (type = 'landing', filters = {}) => {
  let endpoint = '/uat/landingGet';
  if (type === 'did') {
    endpoint = '/uat/didGet';
  }
  const query = Object.keys(filters).length
    ? '?' + new URLSearchParams(filters).toString()
    : '';

  const response = await api.get(`${endpoint}${query}`);

  return response.data;
};
