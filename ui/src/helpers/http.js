import axios from 'axios';
import Config from 'src/helpers/config';
import Cookies from 'js-cookie';

const baseURL = Config.get('apiUrl');
const token = Cookies.get('token');

axios.defaults.headers.common.Authorization = `Bearer ${token}`;

const instance = axios.create({
  baseURL,
});

export default instance;
