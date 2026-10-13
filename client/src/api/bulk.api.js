import { http } from './client';

export const bulkApi = {
  async run(payload) {
    const { data } = await http.post('/items/bulk', payload);
    return data.data; // { matched, modified }
  },
};