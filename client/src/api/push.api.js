import { http } from './client';

export const pushApi = {
  async getPublicKey() {
    const { data } = await http.get('/push/public-key');
    return data.data.publicKey;
  },

  async subscribe(subscription) {
    await http.post('/push/subscriptions', subscription);
  },

  async unsubscribe(endpoint) {
    await http.post('/push/unsubscribe', { endpoint });
  },

  async test() {
    const { data } = await http.post('/push/test');
    return data.data; // { devices }
  },
};