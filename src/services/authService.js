import api from "./api";

const register = async (userData) => {
  const response = await api.post("/customer/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/customer/auth/login", credentials);
  return response.data;
};

const authService = {
  register,
  login,
};

export default authService;