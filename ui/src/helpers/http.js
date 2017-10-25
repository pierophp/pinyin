import axios from 'axios';
import Config from 'src/helpers/config';
import Cookies from 'js-cookie';

const baseURL = Config.get('apiUrl');
axios.defaults.headers.common.Authorization = `Bearer ${Cookies.get('token')}`;

const instance = axios.create({
  baseURL,
});

export default instance;
