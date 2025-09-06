import  api  from '~/services/api';

const getUsers = () => {
  return api.get('/Users');
};

const addUser = (user: any) => {
  return api.post('/Users', user);
};

const updateUser = (userId: number, userData: any) => {
  return api.put(`/Users/${userId}`, userData);
};

const deleteUser = (userId: number) => {
  return api.delete(`/Users/${userId}`);
};

export const UserService = {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
};   