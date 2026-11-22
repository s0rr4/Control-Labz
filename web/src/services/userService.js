import { httpRequest } from './httpClient';
import { DEMO_MODE, demoStore } from './demoStore';

export const userService = {
  list: () => DEMO_MODE ? Promise.resolve(demoStore.users) : httpRequest('/api/users'),
  changeRole: (id, rol) => {
    if (DEMO_MODE) {
      const user = demoStore.users.find((item) => item.id === Number(id));
      if (user) user.rol = rol;
      return Promise.resolve(user);
    }
    return httpRequest(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ rol }) });
  },
};
