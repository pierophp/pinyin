import Cookies from 'js-cookie';
import LocalStorage from 'src/helpers/local-storage';
import Config from 'src/helpers/config';
import http from 'src/helpers/http';


const apiUrl = Config.get('apiUrl');

class User {
  static async login(parsed) {
    let auth = 'google';
    if (parsed.route === 'login-baidu') {
      auth = 'baidu';
    }

    let response;

    if (auth === 'google') {
      response = await http
      .get(`${apiUrl}auth/google/callback`, {
        params: { code: parsed.code },
      });
    } else if (auth === 'baidu') {
      response = await http
      .get(`${apiUrl}auth/baidu/callback`, {
        params: { code: parsed.code },
      });
    }

    let tokenDomain = '';
    if (window.location.host.indexOf('2pinyin.net') !== -1) {
      tokenDomain = '.2pinyin.net';
    }

    Cookies.set('token', response.data.token, { domain: tokenDomain });

    // LocalStorage.save('token', response.data.token);
    LocalStorage.save('user', response.data.user);

    return response.data.user;
  }

  static logout() {
    Cookies.remove('token');
    // LocalStorage.remove('token');
    LocalStorage.remove('user');
    window.location = '/';
  }

  static isLogged() {
    return !!Cookies.get('token');
  }

  static getUser() {
    return LocalStorage.get('user') || {};
  }
}

export default User;
