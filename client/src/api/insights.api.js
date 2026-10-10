import { http } from './client';

export const insightsApi = {
  async get() {
    const { data } = await http.get('/insights');
    return data.data.insights;
  },
};