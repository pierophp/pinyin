import axios from 'axios';
import Config from 'src/helpers/config';
import Cookies from 'js-cookie';

const baseURL = Config.get('apiUrl');
const token = Cookies.get('token');

const instance = axios.create({
  baseURL,
  headers: {
    Authorization: {
      toString() {
        return `Bearer ${token}`;
      },
    },
  },
});

export default instance;
