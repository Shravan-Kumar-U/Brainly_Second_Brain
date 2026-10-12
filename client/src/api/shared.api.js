import { http } from './client';

export const sharedApi = {
  async get(token) {
    const { data } = await http.get(`/shared/${token}`);
    return data.data; // { collection, items }
  },
};