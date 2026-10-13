import { http } from './client';

export const windowsApi = {
  async list() {
    const { data } = await http.get('/windows');
    return data.data.windows;
  },

  async create(payload) {
    const { data } = await http.post('/windows', payload);
    return data.data.window;
  },

  async update(id, payload) {
    const { data } = await http.patch(`/windows/${id}`, payload);
    return data.data.window;
  },

  async remove(id) {
    await http.delete(`/windows/${id}`);
  },

  async suggest(minutes) {
    const { data } = await http.get('/windows/suggest', {
      params: minutes ? { minutes } : undefined,
    });
    return data.data; // { hasWindows, suggestions }
  },
};