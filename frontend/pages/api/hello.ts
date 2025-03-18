// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

const api = axios.create({
  baseURL: 'http://18.142.226.154:8000',
});

export default api;