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

        maskObject: {},
        style_input_type: '',
        check_defect_type: false,
        check_defect_notes: false,
        check_defect_system: false
      }
    },
    beforeMount(){
      this.setMask();
    },
    mounted() {
      this.setLimitNotes()
      this.setLimitSystem()
      this.getDivision();
      this.updateTableDivision();
      this.updateTableTypeDefect();
      var myModalEl = document.getElementById('AddDefectModalWindow');
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appVueAddDefect.clearData();
        appVueAddDefect.style_input_type = "#dee2e6";
        appVueDefect.updateTables();
        appVueAddDefect.setLimitNotes();
        appVueAddDefect.setLimitSystem();
    })
    },
    methods: {
      changeTextWork(event){
        if (event.target.value.length > 100){
          event.target.value = event.target.value.slice(0, 100);
        }
      }, /* changeTextWork */
      
      setLimitNotes(event){
        var myText1 = document.getElementById("my-notes");
        var result1 = document.getElementById("notes");
        var limit1 = 100;
        result1.textContent = 0 + "/" + limit1;
  
        myText1.addEventListener('input',function(){
        var textLength1 = myText1.value.length;
        result1.textContent = textLength1 + "/" + limit1;
        });
      }, /* setLimitNotes */

      setLimitSystem(event){
        var myText = document.getElementById("my-system");
        var result = document.getElementById("system");
        var limit = 100;
        result.textContent = 0 + "/" + limit;
  
        myText.addEventListener('input',function(){
        var textLength = myText.value.length;
        result.textContent = textLength + "/" + limit;
        });
      }, /* setLimitSystem */
      
      changeTextCorrection(event){
        if (event.target.value){
          this.style_input_type = "lime"
        }
      }, /* changeTextWork */

      setMask() {
        console.log()
      }, /* setMask */

      onChangeTypeDefect(event) {
        this.newSystemKKS = '';
      }, /* onChangeTypeDefect */

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
        this.updateTableDivision();
        this.check_defect_type = false;
        this.check_defect_notes = false;
        this.check_defect_system = false;
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
        if (this.newTypeDefect == '0'){
          this.style_input_type = "#ff2851"
          this.check_defect_type = true
          Swal.fire({html:"<b>Тип дефекта должен быть заполнен!</b>", heightAuto: false}); 
        } /* if */
        else if (this.newDefectNotes == ''){
          this.check_defect_notes = true
          Swal.fire({html:"<b>Описание дефекта должно быть заполнено!</b>", heightAuto: false}); 
        } /* else if */
        else if (this.newSystemName == ''){
          this.check_defect_system = true
          Swal.fire({html:"<b>Оборудование должно быть заполнено!</b>", heightAuto: false}); 
        } /* else if */
        else if (this.newDivisionOwner_id == '0' ){
              Swal.fire({html:"<b>Все значения (кроме KSS и Местоположения) должны быть заполнены!</b>", heightAuto: false}); 
        } /* else if */
        else if (this.newSystemKKS !== '' && !this.maskObject.completed) {
          Swal.fire({html:"<b>Код KKS введен не полностью!</b>", heightAuto: false});
        }
        else if (!this.maskObject.completed && (this.placeholders[this.newTypeDefect] === '##XXX##XN##AAAAAA' ?  this.newSystemKKS.length > this.placeholders[this.newTypeDefect].slice(0,10).length : true)) {
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

