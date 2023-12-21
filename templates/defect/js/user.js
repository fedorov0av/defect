const appVueUser = Vue.createApp({
    data() {
      return {
        colunmsName: ['ID', 'Фамилия', 'Имя', 'Отчество', 'Должность', 'Подразделение', 'Роль', 'Почта'],
        users: {},
        roles: {},
        divisions: {},
        
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

      }
    },
    methods: {
        closeCardUserModalWindow() {
          console.log('closeCardUserModalWindow');
          
          this.clearData();
        }, /* closeCardUserModalWindow */
        clearData() {
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
        }, /* updateAllTables */
        addNewUser() {
          if (this.newUserSurname == '' || this.newUserName == '' || this.newUserPosition == ''
              || this.newUserDivision == '' || this.newUserRole == '' || this.newUserEmail == '' || this.newUserTempPassword == ''){
                Swal.fire({html:"<b>Все значения (кроме отчества) должны быть заполнены!</b>", heightAuto: false}); 
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
                Swal.fire({html:"<b>Пользователь добавлен!</b>", heightAuto: false}); 
                document.getElementById('closeModalAddUser').click();
                
                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при добавлении пользователя! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
          } /* else */
        }, /* addNewUser */
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