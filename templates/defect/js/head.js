const appVueHead = Vue.createApp({
  data() {
    return {
      currentUser: {},
      userFioEmail: '',
      currentUserRole: '',
      fedorovCSS: false,
    }
  },
  methods: {
    logOut(event = NaN) {
      axios
      .post('/log_out')
      .then(response => {
          window.location.replace("/");
          /* window.location.href = "/"; */
        })
      .catch(err => {
          Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
          console.log(err);
          }
      ) /* axios */
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
          this.userFioEmail = this.currentUser.user_surname+' '+this.currentUser.user_name+' ['+this.currentUser.user_email+'] '+'('+this.currentUser.user_division+') ' + '('+this.currentUser.user_role+')';
          this.currentUserRole = this.currentUser.user_role;
          if (this.currentUser.user_email == 'A.Fedorov@akkuyu.com') {
            this.fedorovCSS = true;
          } // мега ФИЧА Вадима
        })
      if (typeof(appVueFilter) !== 'undefined'){
        appVueFilter.useFilter();
      }
      
      
  },
}).mount('#vueHead')
