import { http } from './client';

export const exportApi = {
  async download() {
    // Building the file can take a few seconds for a large library
    const { data } = await http.get('/export', { timeout: 60_000 });
    return data;
  },
};