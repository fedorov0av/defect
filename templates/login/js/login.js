const app = Vue.createApp({
  data() {
    return {
      typeButton: '',
      email: '',
      password: '',
      postData: {email: 'login', password: 'password'},
    }
  },
  methods: {
    createPost(event = NaN) { 
      this.postData.email = this.email;
      this.postData.password = this.password;
      axios
      .post('/auth', this.postData)
      .then(response => {
        this.responseData = response;
        /* router.push({ path: '/defect' }) */
        window.location.replace("/defect")
        window.location.href = "/defect";
      })
      .catch(err => {
      if (err.request.status == 401) {
        console.log(err.request.responseData)
        Swal.fire({html:"<b>Неправильный логин или пароль</b>", heightAuto: false}); 
      }
      if (err.request.status == 403) {
        Swal.fire({html:"<b>Неправильный пароль</b>", heightAuto: false}); 
      }
      });
    },
  },
}).mount('#vueLogin')