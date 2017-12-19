import axios from 'axios';
import Config from 'src/helpers/config';
import Cookies from 'js-cookie';

const baseURL = Config.get('apiUrl');
const token = Cookies.get('token');

axios.defaults.headers.common.Authorization = `Bearer ${token}`;
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0';

const instance = axios.create({
  baseURL,
});

export default instance;
