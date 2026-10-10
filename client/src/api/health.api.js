import { http } from './client';

export const healthApi = {
  async check() {
    const { data } = await http.get('/health');
    return data; // { service, uptime, database, timestamp }
  },
};