import { http } from './client';

const unwrap = ({ data }) => data.data.collection;

export const collectionsApi = {
  async list() {
    const { data } = await http.get('/collections');
    return data.data.collections;
  },

  create: (payload) => http.post('/collections', payload).then(unwrap),
  update: (id, payload) => http.patch(`/collections/${id}`, payload).then(unwrap),
  async remove(id) {
    await http.delete(`/collections/${id}`);
  },

  enableShare: (id) => http.post(`/collections/${id}/share`).then(unwrap),
  regenerateShare: (id) => http.post(`/collections/${id}/share/regenerate`).then(unwrap),
  disableShare: (id) => http.delete(`/collections/${id}/share`).then(unwrap),
};