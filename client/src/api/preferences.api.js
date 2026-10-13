import { http } from './client';

export const preferencesApi = {
  async get() {
    const { data } = await http.get('/preferences');
    return data.data.preferences;
  },

  async update(payload) {
    const { data } = await http.patch('/preferences', payload);
    return data.data.preferences;
  },

  async previewWeeklyReview() {
    const { data } = await http.post('/preferences/weekly-review/preview');
    return data.data;
  },
};