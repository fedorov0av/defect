const appVueUser = Vue.createApp({
    data() {
      return {
        colunmsName: ['ID', 'Фамилия', 'Имя', 'Отчество', 'Должность', 'Подразделение', 'Роль', 'Почта'],
        users: {},
        roles: {},
        divisions: {},
        emails: [],
        
        newUserSurname: Vue.ref(),
        newUserFathername: '',
        newUserName: '',
        newUserPosition: '',
        newUserDivision: '',
        newUserRole: '',
        newUserEmail: '',
        newUserTempPassword: '',

        cardUserSurname: '',
        cardUserFathername: '',
        cardUserName: '',
        cardUserPosition: '',
        cardUserDivision: '',
        cardUserRole: '',
        cardUserEmail: '',
        cardUserID: '',

      }
    },
    mounted() {
      var myModalEl = document.getElementById('AddUserModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        console.log(event);
        appVueUser.clearData();
    })
    },
    methods: {
        clearData() {
          this.newUserSurname = '';
          this.newUserName = '';
          this.newUserFathername = '';
          this.newUserPosition = '';
          this.newUserDivision = '';
          this.newUserRole = '';
          this.newUserEmail = '';
          this.newUserTempPassword = '';
        }, /* clearData */
        closeCardUserModalWindow() {
          console.log('closeCardUserModalWindow');
          
          this.clearData();
        }, /* closeCardUserModalWindow */
        clearData2() {
          cardUserSurname = '';
          cardUserFathername = '';
          cardUserName = '';
          cardUserPosition = '';
          cardUserDivision = '';
          cardUserRole = '';
          cardUserEmail = '';
        }, /* clearData */
        updateTableUser() {
            axios
            .post('/users',)
            .then(response => {
                this.users = response.data;
                console.log(this.users);
                  }) /* axios */
          }, /* updateTableUser */
        updateTableEmails() {
            axios
            .post('/users/emails',)
            .then(response => {
                this.emails = response.data;
                /* console.log(Object.values(this.emails)); */
                  }) /* axios */
          }, /* updateTableEmails */
        updateTableRole() {
            axios
            .post('/roles',)
            .then(response => {
                this.roles = response.data;
                console.log(this.roles);
                  }) /* axios */
        }, /* updateTableRole */
        updateTableDivision() {
          axios
          .post('/divisions',)
          .then(response => {
              this.divisions = response.data;
              console.log(this.divisions);
                }) /* axios */
        }, /* updateTableDivision */
        updateAllTables() {
          this.updateTableUser();
          this.updateTableRole();
          this.updateTableDivision();
          this.updateTableEmails()
        }, /* updateAllTables */
        addNewUser() {
          if (this.newUserSurname == '' || this.newUserName == '' || this.newUserPosition == ''
              || this.newUserDivision == '' || this.newUserRole == '' || this.newUserEmail == '' || this.newUserTempPassword == ''){
                Swal.fire({html:"<b>Все значения (кроме отчества) должны быть заполнены!</b>", heightAuto: false}); 
          }  /* if */
          if (Object.values(this.emails).includes(this.newUserEmail)) {
            Swal.fire({html:"<b>Такой логин уже существует!</b>", heightAuto: false}); 
          } /* if */
          else {
            axios
            .post('/user/add', 
                  {
                    "user_surname": this.newUserSurname,
                    "user_name": this.newUserName,
                    "user_fathername": this.newUserFathername,
                    "user_position": this.newUserPosition,
                    "user_division": this.newUserDivision,
                    "user_role": this.newUserRole,
                    "email": this.newUserEmail,
                    "password": this.newUserTempPassword
                  }
            )
            .then(response => {
                console.log(response.data);
                Swal.fire({html:"<b>Пользователь добавлен</b>", heightAuto: false}); 
                document.getElementById('closeModalAddUser').click();
                
                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при добавлении пользователя. Обратитесь к администратору.</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
          } /* else */
        }, /* addNewUser */
        editUser() {
          if (this.cardUserSurname == '' || this.cardUserName == '' || this.cardUserPosition == ''
              || this.cardUserDivision == '' || this.cardUserRole == '' || this.cardUserEmail == ''){
                Swal.fire({html:"<b>Все значения (кроме отчества) должны быть заполнены</b>", heightAuto: false}); 
          } /* if */
          else {
            axios
            .post('/user/update', 
                  {
                    "user_id": this.cardUserID,
                    "user_surname": this.cardUserSurname,
                    "user_name": this.cardUserName,
                    "user_fathername": this.cardUserFathername != '' ? this.cardUserFathername : this.cardUserFathername,
                    "user_position": this.cardUserPosition,
                    "user_division": this.cardUserDivision,
                    "user_role": this.cardUserRole,
                    "email": this.cardUserEmail,
                  }
            )
            .then(response => {
                console.log(response.data);
                Swal.fire({html:"<b>Данные пользователя изменены</b>", heightAuto: false}); 
                document.getElementById('closeModalCardUser').click();
                this.updateTableUser();
                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при изменении данных пользователя! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
          } /* else */
        }, /* editUser */
        handleDoubleClick (event){
          console.log(event.target.parentNode.childNodes[0].textContent)
          id_user = event.target.parentNode.childNodes[0].textContent
          axios
            .post('/user/',{
              "user_id": parseInt(id_user),
            })
            .then(response => {
              user = response.data;
              console.log(user);
              this.cardUserID = user.user_id;
              this.cardUserSurname = user.user_surname;
              this.cardUserFathername = user.user_fathername;
              this.cardUserName = user.user_name;
              this.cardUserPosition = user.user_position;
              this.cardUserDivision = user.user_division;
              this.cardUserRole = user.user_role;
              this.cardUserEmail = user.user_email; 

              var myModal = new bootstrap.Modal(document.getElementById('CardUserModalWindow'), {
                keyboard: false
              })
              myModal.show()
                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки пользователя! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
          
        }, /* handleDoubleClick */
        }, /* methods */

      },
  ).mount('#vueUser')