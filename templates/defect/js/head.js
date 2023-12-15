const appVueHead = Vue.createApp({
    data() {
      return {
        currentUser: {},
        userFioEmail: '',
      }
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