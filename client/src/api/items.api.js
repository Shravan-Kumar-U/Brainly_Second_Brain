import { http } from './client';

export const itemsApi = {
  async list(params) {
    const { data } = await http.get('/items', { params });
    return { items: data.data.items, meta: data.meta };
  },

  async create(payload) {
    const { data } = await http.post('/items', payload);
    return data.data.item;
  },

  async preview(url) {
    const { data } = await http.post('/items/preview', { url });
    return data.data.preview;
  },

  async update(id, payload) {
    const { data } = await http.patch(`/items/${id}`, payload);
    return data.data.item;
  },

  async complete(id) {
    const { data } = await http.post(`/items/${id}/complete`);
    return data.data.item;
  },

  async snooze(id, minutes) {
    const { data } = await http.post(`/items/${id}/snooze`, { minutes });
    return data.data.item;
  },

  async archive(id) {
    const { data } = await http.post(`/items/${id}/archive`);
    return data.data.item;
  },

  async restore(id) {
    const { data } = await http.post(`/items/${id}/restore`);
    return data.data.item;
  },

  async refreshMetadata(id) {
    // Fetching another website can take several seconds
    const { data } = await http.post(`/items/${id}/refresh-metadata`, null, { timeout: 30000 });
    return data.data.item;
  },

  async remove(id) {
    await http.delete(`/items/${id}`);
  },

  async tags() {
    const { data } = await http.get('/items/tags');
    return data.data.tags;
  },
};