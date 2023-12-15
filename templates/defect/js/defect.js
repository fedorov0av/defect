const appVueDefect = Vue.createApp({
    data() {
      return {
        defect_divisions: {},
        defect_type_defects: {},

        newSystemName: '',
        newSystemKKS: '',
        newDefectNotes: '',
        newLocation: '',
        newTypeDefect: '',
        newDivisionOwner: '',
      }
    },
    mounted() {
      this.updateTableDivision()
      this.updateTableTypeDefect()
    },
    methods: {
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
            console.log(this.defect_divisions);
              }) /* axios */
      }, /* updateTableDivision */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
            console.log(this.defect_type_defects);
              }) /* axios */
      }, /* updateTableTypeDefect */
      addNewDefect() {
        if (this.newSystemName == '' || this.newDefectNotes == '' || this.newTypeDefect == '' || this.newDivisionOwner == ''){
              Swal.fire({html:"<b>Все значения (кроме KSS) должны быть заполнены!</b>", heightAuto: false}); 
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
              Swal.fire({html:"<b>Дефект добавлен!</b>", heightAuto: false}); 
              document.getElementById('closeModalAddUser').click();
              
                })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при добавлении пользователя! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
        } /* else */
      }, /* addNewUser */
      },
      },
    ).mount('#vueDefect')