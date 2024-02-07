const app = Vue.createApp({
  data() {
    return {
      typeButton: '',
      email: '',
      password: '',
      csrf_token: '',
      postData: {email: 'login', password: 'password'},
    }
  },
  mounted() {
    csrf = document.getElementById('csrf_token');
    /* console.log(csrf.value) */
    this.csrf_token = csrf.value
  }, 
  methods: {
    createPost(event = NaN) { 
      this.postData.email = this.email;
      this.postData.password = this.password;
      headers = {
        'X-CSRF-Token': this.csrf_token,
      }
      axios
      .post('/auth', this.postData, {
        headers: headers
      })
      .then(response => {
        this.responseData = response;
        /* router.push({ path: '/defect' }) */
        window.location.replace("/defect")
        window.location.href = "/defect";
      })
      .catch(err => {
      if (err.request.status == 422) {
          console.log(err.request)
          Swal.fire({html:"<b>Проверьте правильность заполнения почтового адреса! Пример: @</b>", heightAuto: false}); 
      }
      if (err.request.status == 401) {
        Swal.fire({html:"<b>Неправильный логин или пароль</b>", heightAuto: false}); 
      }
      if (err.request.status == 403) {
        Swal.fire({html:"<b>Неправильный пароль</b>", heightAuto: false}); 
      }
      });
    },
  },
}).mount('#vueLogin')