import { http } from './client';

export const authApi = {
  async register(payload) {
    const { data } = await http.post('/auth/register', payload);
    return data.data; // { user, accessToken, refreshToken }
  },

  async login(payload) {
    const { data } = await http.post('/auth/login', payload);
    return data.data;
  },

  async me() {
    const { data } = await http.get('/auth/me');
    return data.data.user;
  },

  async logout(refreshToken) {
    await http.post('/auth/logout', { refreshToken });
  },
};