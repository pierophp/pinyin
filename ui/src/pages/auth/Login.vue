<template>
  <div class="login-container">
  <loadable-content :loading="loading">
      <br/>
      <a class="btn btn-social btn-lg btn-google" href="javascript:void(0)" @click="goToAuth(authGoogleUrl)">
        <i class="fa fa-google"></i>
        {{ $t("sign_in_google") }}
      </a>

      <a class="btn btn-social btn-lg btn-google btn-baidu" href="javascript:void(0)" @click="goToAuth(authBaiduUrl)">
        <i class="fa fa-baidu"></i>
        {{ $t("sign_in_baidu") }}
      </a>
  </loadable-content>
  </div>
</template>

<script>
  import User from 'src/domain/user';
  import Config from 'src/helpers/config';
  import QueryString from 'query-string';
  import LoadableContent from 'src/components/common/loading/LoadableContent';
  import LocalStorage from 'src/helpers/local-storage';

  export default {
    name: 'login',
    components: {
      LoadableContent,
    },
    data() {
      return {
        loading: true,
        authGoogleUrl: `${Config.get('apiUrl')}auth/google`,
        authBaiduUrl: `${Config.get('apiUrl')}auth/baidu`,
      };
    },
    methods: {
      goToAuth(url) {
        const urlToRedirect = window.location.href.split('/#');
        LocalStorage.save('login-url', `${urlToRedirect[0]}${this.$route.meta.redirectTo}`);
        window.location = url;
      },
    },
    created() {
      if (User.isLogged()) {
        let redirectTo = LocalStorage.get('login-url');
        if (redirectTo) {
          LocalStorage.save('login-url', '');
        } else {
          redirectTo = this.$route.meta.redirectTo;
        }

        window.location = redirectTo;
      }

      let parsed = this.$route.query;
      if (!parsed.code) {
        parsed = QueryString.parse(location.search);
      }
      parsed.route = this.$route.name;

      if (parsed.code) {
        let redirectTo = LocalStorage.get('login-url');
        if (redirectTo) {
          LocalStorage.save('login-url', '');
        } else {
          redirectTo = this.$route.meta.redirectTo;
        }

        User.login(parsed)
          .then(() => {
            window.location = redirectTo;
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    },
  };
</script>

<style>
.btn-google {
  color: #fff !important;
}

.btn-baidu {
  background-color: #2529d8 !important;
  color: #fff !important;
}
.btn-baidu i {
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjU5cHgiIGhlaWdodD0iNjVweCIgdmlld0JveD0iMCAwIDU5IDY1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy40ICgxNTU4OCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+YmFpZHU8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBza2V0Y2g6dHlwZT0iTVNQYWdlIj4KICAgICAgICA8ZyBpZD0iYmFpZHUiIHNrZXRjaDp0eXBlPSJNU0xheWVyR3JvdXAiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMC4xMjUsMjQgQzAuMDYyLDI0LjQzOCAwLDI0Ljg3NSAwLDI1LjMxMyBDMCwyNS45MzggMC4wNjMsMjYuNjI2IDAuMjUsMjcuMzc2IEMwLjUsMjguNjI2IDAuOTM4LDI5Ljg3NiAxLjYyNSwzMS4wNjQgQzIuMjUsMzIuMjUyIDMuMTg4LDMzLjE4OSA0LjUsMzMuODE0IEM1LjMxMywzNC4yNTIgNi4yNSwzNC41MDIgNy4yNSwzNC41MDIgQzcuODEzLDM0LjUwMiA4LjMxMywzNC40MzkgOC44NzUsMzQuMzE0IEMxMC41LDMzLjkzOSAxMS43NSwzMy4yNTEgMTIuNjg4LDMyLjE4OSBDMTMuNjg4LDMxLjE4OSAxNC4yNTEsMjkuOTM5IDE0LjUwMSwyOC41MDEgQzE0Ljc1MSwyNy4xMjYgMTQuODc2LDI2LjAwMSAxNC44NzYsMjUuMTI2IEwxNC44NzYsMjQuNzUxIEMxNC44NzYsMjQuMDAxIDE0LjgxMywyMy4zMTMgMTQuNjI2LDIyLjYyNiBDMTQuNTAxLDIxLjAwMSAxMy42MjYsMTkuMzc2IDEyLjA2MywxNy42MjYgQzEwLjU2MywxNi4xMjYgOC45MzgsMTUuMzEzIDcuMTI1LDE1LjMxMyBMNi41NjIsMTUuMzEzIEw1Ljk5OSwxNS40MzggQzUuNjI0LDE1LjUwMSA1LjEyNCwxNS42ODggNC41NjEsMTYuMDYzIEMzLjkzNiwxNi4zNzYgMy4zNzMsMTYuODEzIDIuNzQ4LDE3LjM3NiBDMi4xMjMsMTcuOTM5IDEuNjIzLDE4LjgxNCAxLjEyMywxOS45MzkgQzAuNjIzLDIxLjEyNyAwLjMxLDIyLjQzOSAwLjEyMywyNC4wMDIgTDAuMTI1LDI0IFogTTQuMjUsNTUuMTI1IEw0LjkzOCw1Ny4zMTMgQzUuMzc2LDU4Ljc1MSA2LjM3Niw2MC4yNTEgNy44NzYsNjEuNjg4IEM5LjMxNCw2My4wNjMgMTEuMDAxLDYzLjgxMyAxMy4wMDEsNjMuODEzIEwxMy4xODksNjMuODEzIEMxMy44NzcsNjMuOTM4IDE0LjYyNyw2NC4wMDEgMTUuNTAyLDYzLjkzOCBDMTYuMzE1LDYzLjkzOCAxNy4yNTIsNjMuODc1IDE4LjMxNSw2My44MTMgQzIwLjM3OCw2My41NjMgMjEuNzUzLDYzLjM3NSAyMi41MDMsNjMuMjUgQzIzLjI1Myw2My4xMjUgMjMuODE2LDYzLjA2MiAyNC4yNTMsNjIuOTM3IEwyNS44NzgsNjIuNjg3IEMyNi44MTYsNjIuNDk5IDI3Ljk0MSw2Mi40MzcgMjkuMzc4LDYyLjQzNyBMMzAuMjUzLDYyLjQzNyBDMzIuMTI4LDYyLjUgMzMuODE2LDYyLjc1IDM1LjMxNiw2My4yNSBDMzcuOTQxLDY0LjEyNSA0MC4zMTYsNjQuNTYzIDQyLjUwNCw2NC41NjMgQzQ0LjY5Miw2NC41NjMgNDYuMzc5LDY0LjMxMyA0Ny41NjcsNjMuODEzIEM0OC43NTUsNjMuMzEzIDQ5LjgxNyw2Mi42ODggNTAuNzU1LDYxLjgxMyBDNTEuNjkzLDYwLjkzOCA1Mi4yNTUsNjAuMzEzIDUyLjUwNSw1OS45MzggQzUyLjc1NSw1OS41NjMgNTIuOTQzLDU5LjI1IDUzLjAwNSw1OSBMNTMuMzgsNTggQzUzLjU2OCw1Ny4zNzUgNTMuODE4LDU2LjU2MiA1My45NDMsNTUuNSBDNTQuMTMxLDU0LjQzNyA1NC4xOTMsNTMuMzc1IDU0LjE5Myw1Mi4xODcgQzU0LjE5Myw1MC45OTkgNTMuOTQzLDQ5LjgxMiA1My4zOCw0OC40OTkgQzUyLjc1NSw0Ny4yNDkgNTEuOTQyLDQ2LjE4NiA1MC44MTcsNDUuMzc0IEM0OC41MDQsNDMuNDk5IDQ2LjE5Miw0MS40OTkgNDQuMDY3LDM5LjI0OSBDNDEuODc5LDM2Ljk5OSA0MC40NDIsMzUuNDM2IDM5Ljc1NCwzNC42MjQgQzM5LjEyOSwzMy44MTEgMzguNjI5LDMzLjEyNCAzOC4yNTQsMzIuNjI0IEMzNi43NTQsMzAuMzExIDM1LjA2NiwyOC42ODYgMzMuMTkxLDI3LjY4NiBDMzEuNzUzLDI2LjkzNiAzMC4zMTYsMjYuNTYxIDI5LjAwMywyNi41NjEgQzI4LjYyOCwyNi41NjEgMjguMzE1LDI2LjU2MSAyNy44NzgsMjYuNjI0IEMyNi4yNTMsMjYuODc0IDI0LjY5LDI3LjQzNyAyMy4zMTUsMjguMzc0IEMyMS45NCwyOS4zMTEgMjAuODc3LDMwLjQzNyAyMC4xMjcsMzEuODEyIEMxOS4yNTIsMzMuMzEyIDE4LjE4OSwzNC42ODcgMTYuOTM5LDM2IEMxNS43NTEsMzcuMzEzIDE0LjU2NCwzOC40MzggMTMuNTY0LDM5LjMxMyBDMTIuNTAxLDQwLjE4OCAxMS45MzksNDAuNjg4IDExLjgxNCw0MC43NTEgTDEwLjE4OSw0Mi4wNjQgQzkuMDY0LDQzLjAwMiA4LjA2NCw0My45MzkgNy4wNjQsNDUuMDAyIEM2LjEyNiw0Ni4wMDIgNS4zMTQsNDcuNDQgNC42MjYsNDkuMzE1IEM0LjE4OCw1MC41MDMgMy45MzgsNTEuNjI4IDMuOTM4LDUyLjg3OCBDMy45MzgsNTMuNjI4IDQuMDYzLDU0LjM3OCA0LjI1MSw1NS4xMjggTDQuMjUsNTUuMTI1IFogTTEzLjMxMyw0OC41IEwxMy44MTMsNDcuMTg3IEMxNC4xMjYsNDYuMzEyIDE0Ljc1MSw0NS40MzcgMTUuNzUxLDQ0LjU2MiBDMTYuNzUxLDQzLjY4NyAxNy44NzYsNDMuMjQ5IDE5LjEyNiw0My4yNDkgTDIzLjUwMSw0My4yNDkgTDIzLjUwMSwzNy45MzYgTDI3LjEyNiwzNy45OTkgTDI3LjEyNiw1Ny42MjQgTDE5LjAwMSw1Ny42MjQgQzE2LjU2Myw1Ny4xMjQgMTQuODc2LDU1LjkzNiAxMy45MzgsNTQuMTI0IEMxMy40MzgsNTIuODc0IDEzLjE4OCw1MS41NjEgMTMuMTg4LDUwLjI0OSBDMTMuMTg4LDQ5LjY4NiAxMy4yNTEsNDkuMDYxIDEzLjMxMyw0OC40OTkgTDEzLjMxMyw0OC41IFogTTE0Ljg3NSwxMC41IEMxNC44NzUsMTMuMTg4IDE1LjUsMTUuNTYzIDE2Ljg3NSwxNy40MzggQzE4LjE4OCwxOS4zNzYgMTkuODEzLDIwLjMxMyAyMS43NSwyMC4zMTMgQzIzLjY4NywyMC4zMTMgMjUuMzEzLDE5LjM3NSAyNi42MjUsMTcuNDM4IEMyOCwxNS41NjMgMjguNjg4LDEzLjE4OCAyOC42ODgsMTAuNSBDMjguNjg4LDcuNzUgMjgsNS40MzcgMjYuNjI1LDMuNSBDMjUuMzEyLDEuNTYyIDIzLjY4NywwLjYyNSAyMS43NSwwLjYyNSBDMTkuODEzLDAuNjI1IDE4LjE4NywxLjU2MyAxNi44NzUsMy41IEMxNS41LDUuNDM4IDE0Ljg3NSw3Ljc1IDE0Ljg3NSwxMC41IEwxNC44NzUsMTAuNSBaIE0xNy4xMjUsNTEuNjI1IEwxNy40MzgsNTIuMzEzIEMxNy41NjMsNTIuODEzIDE3LjkzOCw1My4yNTEgMTguMzc2LDUzLjY4OCBDMTguODc2LDU0LjE4OCAxOS41MDEsNTQuMzc2IDIwLjE4OSw1NC4zNzYgTDIzLjQzOSw1NC4zNzYgTDIzLjQzOSw0Ni4zNzYgTDE5Ljg3Niw0Ni4zNzYgQzE4LjY4OCw0Ni43NTEgMTcuODEzLDQ3LjUwMSAxNy40MzgsNDguNjI2IEMxNy4xMjUsNDkuMzc2IDE3LDUwLjAwMSAxNyw1MC42MjYgQzE3LDUwLjkzOSAxNy4wNjMsNTEuMzE0IDE3LjEyNSw1MS42MjYgTDE3LjEyNSw1MS42MjUgWiBNMjkuMTI1LDU0LjA2MyBMMjkuMTI1LDQzLjY4OCBMMzIuOTM4LDQzLjYyNSBMMzIuOTM4LDUyLjkzOCBMMzMuMDAxLDUzLjE4OCBDMzMuMTI2LDUzLjMxMyAzMy4yNTEsNTMuNTAxIDMzLjUwMSw1My43NTEgQzMzLjc1MSw1My45MzkgMzQuMDY0LDU0LjA2NCAzNC40MzksNTQuMTI2IEwzOC4yNTIsNTQuMTI2IEwzOC4yNTIsNDMuNjg4IEw0Mi4zMTUsNDMuNjg4IEw0Mi4zMTUsNTcuNTYzIEwzMi45NCw1Ny41NjMgTDMyLjAwMiw1Ny4yNSBDMzEuMzc3LDU3LjA2MiAzMC43NTIsNTYuNjI1IDMwLjA2NCw1Ni4wNjIgQzI5LjQzOSw1NS40OTkgMjkuMTI2LDU0LjgxMiAyOS4xMjYsNTQuMDYyIEwyOS4xMjUsNTQuMDYzIFogTTMyLjUsMTEuMDYzIEMzMi40MzcsMTEuNzUxIDMyLjM3NSwxMi4zNzYgMzIuMzc1LDEzLjAwMSBDMzIuNDM4LDE0LjgxNCAzMi43NSwxNi40MzkgMzMuNDM4LDE3Ljc1MSBDMzQuMjUxLDE5LjYyNiAzNS44NzYsMjAuNjg5IDM4LjI1MSwyMS4wNjQgQzM4LjU2NCwyMS4wNjQgMzguODc2LDIxLjEyNyAzOS4xODksMjEuMTI3IEM0MS4xMjcsMjEuMDY0IDQyLjgxNCwyMC4xODkgNDQuMzE0LDE4LjU2NCBDNDUuOTM5LDE2LjU2NCA0Ny4wMDIsMTQuNDM5IDQ3LjM3NywxMi4wNjQgQzQ3LjM3NywxMS42ODkgNDcuNDQsMTEuMzE0IDQ3LjQ0LDEwLjkzOSBDNDcuNDQsOS4zMTQgNDYuODc3LDcuNjg5IDQ1LjgxNSw2LjAwMSBDNDQuNTAyLDMuOTM4IDQyLjk0LDIuNjg4IDQxLjA2NSwyLjMxMyBDNDAuODE1LDIuMjUgNDAuNTAyLDIuMjUgNDAuMjUyLDIuMjUgQzM4Ljc1MiwyLjI1IDM3LjI1MiwzLjEyNSAzNS42MjcsNC44NzUgQzMzLjc1Miw2LjkzOCAzMi43NTIsOSAzMi41MDIsMTEuMDYzIEwzMi41LDExLjA2MyBaIE00My44NzUsMjkuNjI1IEM0My44NzUsMzAuODc1IDQzLjkzOCwzMS44NzUgNDQuMTI1LDMyLjY4OCBDNDQuMjUsMzMuNTYzIDQ0LjUsMzQuNTAxIDQ1LDM1LjU2MyBDNDUuNDM4LDM2LjU2MyA0Ni4yNSwzNy4zNzYgNDcuNDM4LDM3Ljg3NiBDNDguNTAxLDM4LjMxNCA0OS44MTMsMzguNTY0IDUxLjQzOCwzOC41NjQgTDUxLjgxMywzOC41NjQgQzUyLjYyNiwzOC41NjQgNTMuMzc2LDM4LjUwMSA1NC4wNjMsMzguMzE0IEM1NC43NTEsMzguMDY0IDU1LjMxMywzNy44MTQgNTUuNzUxLDM3LjQzOSBDNTYuMjUxLDM3LjA2NCA1Ni42MjYsMzYuNjI2IDU3LjAwMSwzNi4yNTEgQzU3LjM3NiwzNS44MTMgNTcuNjI2LDM1LjMxMyA1Ny44MTQsMzQuNzUxIEM1OC4wMDIsMzQuMTI2IDU4LjE4OSwzMy42MjYgNTguMzE0LDMzLjE4OCBDNTguNDM5LDMyLjc1IDU4LjUwMiwzMi4yNSA1OC41NjQsMzEuNTYzIEM1OC42MjYsMzAuODc2IDU4LjYyNywzMC40MzggNTguNjI3LDMwLjEyNSBMNTguNjI3LDI3LjkzNyBDNTguNjI3LDI3LjM3NCA1OC41MDIsMjYuNjI0IDU4LjI1MiwyNS44MTIgQzU4LjAwMiwyNSA1Ny41NjQsMjQuMTg3IDU3LjA2NCwyMy4yNDkgQzU2LjUwMSwyMi4zMTEgNTUuNjg5LDIxLjU2MSA1NC42MjYsMjAuOTM2IEM1My41NjMsMjAuMzExIDUyLjI1MSwxOS45OTggNTAuODEzLDE5Ljk5OCBDNDYuMTg4LDE5Ljk5OCA0My44NzUsMjMuMTg2IDQzLjg3NSwyOS42MjMgTDQzLjg3NSwyOS42MjUgWiIgaWQ9IlNoYXBlIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=");
}
.login-container {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
}
</style>
