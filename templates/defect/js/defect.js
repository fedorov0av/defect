const appVueAddDefect = Vue.createApp({
    directives: {'maska': Maska.vMaska},
    data() {
      return {

        defect_divisions: {},
        defect_type_defects: {},
        vueAddUserModalWindow: Vue.ref('vueAddUserModalWindow'),
        placeholders: {
          'ЖД основного оборудования': '##XXX##XX###',
          'ЖД по строительным конструкциям': '##XXX##XN##AAAAAA',
          'ЖД по освещению': '##XXX##XX###',
          'ЖД по системам пожаротушения': '##XXX##',
          },
        popovers: {
            'ЖД основного оборудования': '00 - Номер блока (00, 10, 20, 30, 40)',
            'ЖД по строительным конструкциям': '00XXX00XN00/XX0000',
            'ЖД по освещению': '00XXX00XX000',
            'ЖД по системам пожаротушения': '00XXX00',
            },

        newSystemName: '',
        newSystemKKS: '',
        newDefectNotes: '',
        newLocation: '',
        newTypeDefect: '0',
        newDivisionOwner: '',
        newDivisionOwner_id: 0, /* Для хранения ID ПОДРАЗДЕЛЕНИЯ-ВЛАДЕЛЕЦ  в карточке  */

        maskObject: {}
      }
    },
    beforeMount(){
      this.setMask();
    },
    mounted() {
      this.getDivision();
      this.updateTableDivision();
      this.updateTableTypeDefect();
      var myModalEl = document.getElementById('AddDefectModalWindow');
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appVueAddDefect.clearData();
        appVueDefect.updateTables();
    })
    },
    methods: {
      setMask() {
        console.log()
      }, /* closeAddDefectModalWindow */
      onChangeTypeDefect(event) {
        this.newSystemKKS = '';
      },
      closeAddDefectModalWindow() {
        this.clearData();
      }, /* closeAddDefectModalWindow */
      clearData() {
        this.newSystemName = '';
        this.newSystemKKS = '';
        this.newDefectNotes = '';
        this.newLocation = '';
        this.newTypeDefect = '0';
        this.newDivisionOwner = '';
        this.updateTableDivision()
      }, /* clearData */
      getDivision() {
        axios
          .post('/user/me',{
          })
          .then(response => {
            this.currentUser = response.data;
            this.newDivisionOwner = this.currentUser.user_division;
          })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
      }, /* getDivision */
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
            for (i in this.defect_divisions){
               if (this.defect_divisions[i].division_name == this.currentUser.user_division) {
                this.newDivisionOwner_id = this.defect_divisions[i].division_id} 
            console.log(this.newDivisionOwner_id)
            }
          }) /* axios */
      }, /* updateTableDivision */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
              }) /* axios */
      }, /* updateTableTypeDefect */
      
      checkMask(){
        this.maskObject.completed = this.newSystemKKS.length >= this.placeholders[this.newTypeDefect].slice(0,11).length
      },
      addNewDefect() {
        if (this.placeholders[this.newTypeDefect] === '##XXX##XN##AAAAAA') {
          this.checkMask()
        }
        if (this.newSystemName == '' || this.newDefectNotes == '' || this.newTypeDefect == '0' || this.newDivisionOwner_id == '0' ){
              Swal.fire({html:"<b>Все значения (кроме KSS и Местоположения) должны быть заполнены</b>", heightAuto: false}); 
        } /* if */
        else if (this.newSystemKKS !== '' && !this.maskObject.completed) {
          Swal.fire({html:"<b>Код KKS введен не полностью!</b>", heightAuto: false});
        }
        else if (!this.maskObject.completed && (this.placeholders[this.newTypeDefect] = '##XXX##XN##AAAAAA' ?  this.newSystemKKS.length > this.placeholders[this.newTypeDefect].slice(0,10).length : true)) {
          Swal.fire({html:"<b>KKS введен не полностью!</b>", heightAuto: false});
        }
        else {
          axios
          .post('/defect/add', 
              {
                "defect_description": this.newDefectNotes,
                "defect_system_name": this.newSystemName,
                "defect_system_kks": this.newSystemKKS !== '' ? this.newSystemKKS : null,
                "defect_type_defect_name": this.newTypeDefect,
                "defect_location": this.newLocation,
                "defect_user_division_id": parseInt(this.newDivisionOwner_id),
              }
          )
          .then(response => {
              /* console.log(response.data); */
              Swal.fire({html:"<b>Дефект добавлен</b>", heightAuto: false}); 
              document.getElementById('closeModalAddDefect').click();
                })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при добавлении дефекта. Обратитесь к администратору.</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
        } /* else */
      }, /* addNewDefect */

      },
      },
    ).mount('#vueAddDefect')

