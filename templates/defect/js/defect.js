const appVueAddDefect = Vue.createApp({
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
        if (this.newSystemName == '' || this.newDefectNotes == '' || this.newTypeDefect == '' || this.newLocation == ''){
              Swal.fire({html:"<b>Все значения (кроме KSS) должны быть заполнены!</b>", heightAuto: false}); 
        } /* if */
        else {
          axios
          .post('/defect/add', 
              {
                "defect_description": this.newDefectNotes,
                "defect_system_name": this.newSystemName,
                "defect_system_kks": this.newSystemKKS,
                "defect_type_defect_name": this.newTypeDefect,
                "defect_location": this.newLocation
              }
          )
          .then(response => {
              console.log(response.data);
              Swal.fire({html:"<b>Дефект добавлен!</b>", heightAuto: false}); 
              document.getElementById('closeModalAddUser').click();
              
                })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при добавлении дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
        } /* else */
      }, /* addNewDefect */

      },
      },
    ).mount('#vueAddDefect')

const appVueDefect = Vue.createApp({
    data() {
      return {
        colunmsName: ['№', 'Дата регистрации', 'Подразделение', 'KKS', 'Оборудование', 'Описание дефекта', 'Статус', 'Дата заверш. (план)', 'Руководитель', 'Исполнитель', 'Вид дефекта' ],
        defect_divisions: {},
        defect_type_defects: {},
        defects: {},

      }
    },
    mounted() {
      this.updateTableDefect()
    },  /* mounted */
    methods: {
      updateTableDefect() {
        axios
        .post('/defects',)
        .then(response => {
            this.defects = response.data;
            console.log(this.defects);
              }) /* axios */
      }, /* updateTableDefect */
      handleDoubleClick (event){
        console.log(event)
        console.log(event.target.parentNode.childNodes[0].textContent) 
        defect_id = event.target.parentNode.childNodes[0].textContent
        console.log(defect_id);
        appConfirmDefect.defect_id = defect_id;
        appConfirmDefect.updateTables()
        var myModal = new bootstrap.Modal(document.getElementById('ConfirmDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      }, /* handleDoubleClick */
      },
      },
    ).mount('#vueDefect')




const appConfirmDefect = Vue.createApp({
      data() {
        return {
          defect_id: 0,
          defect_divisions: {},
          defect_type_defects: {},
          cardDefect: {},
        }
      },
      /* mounted() {
        this.updateTableDefect()
      }, */
      methods: {
        updateTables() {
          this.updateTableDivision();
          this.updateTableTypeDefect();
          this.updateTableDefect();
        }, /* updateTables */
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
        
        updateTableDefect() {
          axios
            .post('/get_defect/',{
              "defect_id": parseInt(this.defect_id),
            })
            .then(response => {
              this.cardDefect = response.data;
              console.log('this.cardDefect', this.cardDefect);

                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
          
        }, /* updateTableDefect */
        },
        },
      ).mount('#vueConfirmDefect')
  


