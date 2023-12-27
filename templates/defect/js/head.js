const appVueHead = Vue.createApp({
    data() {
      return {
        currentUser: {},
        userFioEmail: '',
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
    mounted() {
        axios
        .post('/user/me')
        .then(response => {
            this.currentUser = response.data;
            this.userFioEmail = this.currentUser.user_surname+' '+this.currentUser.user_name+' ['+this.currentUser.user_email+'] '+'('+this.currentUser.user_division+')';

            console.log(this.currentUser);
            console.log(this.userFioEmail);

          })
    },
  }).mount('#vueHead')