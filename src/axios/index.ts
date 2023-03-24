import axios from 'axios';

import { API_URL } from '@/constants';
import { error, request, response } from './interceptors';

export const base = axios.create({
  baseURL: API_URL,
});

base.interceptors.request.use(request, error);
base.interceptors.response.use(response, error);

export default base;
