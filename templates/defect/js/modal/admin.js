const appVueAdmin = Vue.createApp({
    data() {
      return {
        emailUser: '',
        resultSearch: '',
        hiddenButtomAuthUser: true,
        lastUserMail: '',
      }
    }, 
    mounted() {
        var myModalEl = document.getElementById('AdminModalWindow')
        myModalEl.addEventListener('hidden.bs.modal', function (event) {
            appVueAdmin.clearData();
        })
    },  /* mounted */
    methods: { 
        clearData() {
            this.emailUser = '';
            this.resultSearch = '';
            this.hiddenButtomAuthUser = true;
          }, /* clearData */
        searchUserByEmail(){
            if (this.emailUser === '') {
                Swal.fire({html:"<b>Поле Email пустое!</b>", heightAuto: false}); 
                return;  
            }
            var myModal = new bootstrap.Modal(document.getElementById('AdminPassModalWindow'), {
                keyboard: false
              })
            myModal.show()
        }, /* searchUserByEmail */
        authByUser(){
          if (this.lastUserMail === '') {
            Swal.fire({html:"<b>Данных о пользователе нет!</b>", heightAuto: false}); 
            return;  
          }
          axios
          .post('/auth_by_user_id', {
              "user_id": this.lastUserMail.split('@')[0]
          },)
          .then(response => {
              window.location.replace("/defect")
              window.location.href = "/defect";
          })
          .catch(err => {
              console.log(err.request)
              Swal.fire({html:"<b>Произошла ошибка!</b>", heightAuto: false}); 
          });

      }, /* authByUser */
    },  
    beforeMount() {
      
    },
  }).mount('#vueAdmin');
  


/* ================================== */

const appVueAdminPass = Vue.createApp({
    data() {
      return {
        passAdmin: '',
      }
    }, 
    mounted() {
        var myModalEl = document.getElementById('AdminPassModalWindow')
        myModalEl.addEventListener('hidden.bs.modal', function (event) {
            appVueAdminPass.clearData();
        })
    },  /* mounted */
    methods: {
        clearData() {
            this.passAdmin = '';
          }, /* clearData */
        sendPass(){
            axios
            .post('/get_user_info_by_mail', {
              "password": {"password": this.passAdmin},
              "email": {"email": appVueAdmin.emailUser}
            },)
            .then(response => {
                user_info = response.data.user_LDAP;
                appVueAdmin.resultSearch = 'description ='+user_info.description+'\n'+'department ='+user_info.department+'\n'+'extensionAttribute2 ='+user_info.extensionAttribute2+'\n'+'mail ='+user_info.mail+'\n'+'sAMAccountName ='+user_info.sAMAccountName+'\n'
                appVueAdmin.lastUserMail = appVueAdmin.emailUser;
                appVueAdmin.hiddenButtomAuthUser = false;
                document.getElementById('closePassAdminModal').click();
            })
            .catch(err => {
            if (err.request.status == 422) {
                console.log(err.request)
                Swal.fire({html:"<b>Проверьте правильность заполнения почтового адреса пользователя! Пример: @</b>", heightAuto: false});
                document.getElementById('closePassAdminModal').click();
                return
            }
            if (err.request.status == 401) {
              Swal.fire({html:"<b>Неправильный логин или пароль</b>", heightAuto: false}); 
              document.getElementById('closePassAdminModal').click();
              return
            } else if (err.request.status == 403) {
              Swal.fire({html:"<b>Неправильный пароль</b>", heightAuto: false});
            } else if (err.request.status == 417) {
              Swal.fire({html:"<b>Не найден пользователь!</b>", heightAuto: false});
            } else if (err.request.status == 418) {
              Swal.fire({html:"<b>Сервер работает в режиме 'База данных'!</b>", heightAuto: false}); 
              document.getElementById('closePassAdminModal').click();
            } else {
              Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err); 
            }
            });
        }, /* sendPass */
    },  
    beforeMount() {
      
    },
  }).mount('#vueAdminPass');