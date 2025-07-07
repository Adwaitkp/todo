import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token');

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const register = (username, password) =>
  axios.post(`${API_URL}/auth/register`, { username, password });

export const login = (username, password) =>
  axios.post(`${API_URL}/auth/login`, { username, password });

export const fetchTasks = () =>
  axios.get(`${API_URL}/tasks`, authHeader());

export const createTask = (data) =>
  axios.post(`${API_URL}/tasks`, data, authHeader());

export const updateTask = (id, data) =>
  axios.put(`${API_URL}/tasks/${id}`, data, authHeader());

export const deleteTask = (id) =>
  axios.delete(`${API_URL}/tasks/${id}`, authHeader());

export const smartAssign = (id) =>
  axios.post(`${API_URL}/tasks/${id}/smart-assign`, {}, authHeader());

export const fetchActions = () =>
  axios.get(`${API_URL}/actions`, authHeader()); 