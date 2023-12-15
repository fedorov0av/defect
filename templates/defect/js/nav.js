const appVueNav = Vue.createApp({
    data() {
      return {
        currentUser: {},
        userFioEmail: '',
        showModal: false,
      }
    },
    methods: {
        logOut(event = NaN) {
            document.cookie = 'jwt_access_token=;jwt_refresh_token=;path=/';
            console.log(document.cookie);
            window.location.replace("/");
            /* window.location.href = "/"; */
          },
        showModalUsers(){
            appVueUser.updateAllTables();
        },
      },
    }).mount('#vueNav')