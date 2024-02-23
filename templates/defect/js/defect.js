const appVueAddDefect = Vue.createApp({
    directives: {'maska': Maska.vMaska},
    data() {
      return {

        defect_divisions: {},
        defect_type_defects: {},
        categories_reason: {},
        categories_defect: {},
 
        vueAddUserModalWindow: Vue.ref('vueAddUserModalWindow'),
        placeholders: {
          'ЖД оборудования': '##XXX##XX###',
          'ЖД по конструкциям и ЗИС': '##XXX##XN##AAAAAA',
          'ЖД по освещению': '##XXX##XX###',
          'ЖД по системам пожаротушения': '##XXX##',
          },
        popovers: {
            'ЖД оборудования': '00 - Номер блока (00, 10, 20, 30, 40)',
            'ЖД по конструкциям и ЗИС': '00XXX00XN00/XX0000',
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
        newCoreClassificationCode: '0',
        newCoreClassificationName: '',
        newCategoryDefect: 0,
        newClassSystemName: '',
        newDirectClassificationCode: '',   
        newDirectClassificationName: '',   

        maskObject: {},
        style_input_type: '',
        check_defect_type: false,
        check_defect_notes: false,
        check_defect_system: false,
        newSafety: false,
        newPnr: false,
        newExploitation: false,
        isHiddenblockmain: 'false',
        isHiddenblockhistory: 'false',
        isHiddenblockclassification: 'false',
        backgroundMainButtonCCS: "btn-primary",
        backgroundHistoryButtonCCS: "btn-outline-primary",
        backgroundСlassificationButtonCCS: "btn-outline-primary",
        isDisabledAddDefect: false,
      }
    },
    beforeMount() {
      this.setMask();
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserDivision = this.currentUser.user_division;
          if (this.currentUserDivision != 'РусАС') {
            this.isDisabledAddDefect = true;
          }
        })
    },
    mounted() {
      this.setLimitNotes()
      this.setLimitSystem()
      this.setLimitLocation()
      this.getDivision();
      this.updateCategoriesReason();
      this.updateCategoriesDefect();
      this.updateTableDivision();
      this.updateTableTypeDefect();
      this.isHiddenblockclassification  = 'true';
      var myModalEl = document.getElementById('AddDefectModalWindow');
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appVueAddDefect.clearData();
        appVueAddDefect.style_input_type = "#dee2e6";
        appVueDefect.updateTables(); // Что это?!
        appVueAddDefect.updateTables();
        appVueAddDefect.setLimitNotes();
        appVueAddDefect.setLimitSystem();
        appVueAddDefect.setLimitLocation();
    })
      
    },
    methods: {
      changeTextWork100(event){
        if (event.target.value.length > 100){
          event.target.value = event.target.value.slice(0, 100);
        }
      }, /* changeTextWork100 */

      changeTextWork200(event){
        if (event.target.value.length > 200){
          event.target.value = event.target.value.slice(0, 200);
        }
      }, /* changeTextWork200 */
      
      setLimitNotes(event){
        var myText1 = document.getElementById("my-notes");
        var result1 = document.getElementById("notes");
        var limit1 = 200;
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
      changeCoreClassificationCode(event){
        category_reason = this.categories_reason.filter((category_reason) => category_reason.category_reason_code === event.target.value)
        this.newCoreClassificationName = category_reason[0].category_reason_name
      },
      setLimitLocation(event){
        var myText = document.getElementById("work-location");
        var result = document.getElementById("location");
        var limit = 100;
        result.textContent = 0 + "/" + limit;
  
        myText.addEventListener('input',function(){
        var textLength = myText.value.length;
        result.textContent = textLength + "/" + limit;
        });
      }, /* setLimitLocation */
      
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
        this.newCoreClassificationCode = '0';
        this.newCoreClassificationName = '';
        this.newDirectClassificationCode = '';
        this.newDirectClassificationName = '';
        
        this.newClassSystemName = '';
        this.newCategoryDefect = 0;
        this.newSafety = false;
        this.newPnr = false;
        this.newExploitation = false;

        this.updateTableDivision();
        this.check_defect_type = false;
        this.check_defect_notes = false;
        this.check_defect_system = false;
      }, /* clearData */

      updateTables() {
        this.clickbuttonmain();

      }, /* updateTables */

      getDivision() {
        axios
          .post('/user/me',{
          })
          .then(response => {
            this.currentUser = response.data;
            this.newDivisionOwner = this.currentUser.user_division;
          })
          .catch(err => {
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
              }
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
      updateCategoriesReason() {
        axios
        .post('/get_categories_core_reason',)
        .then(response => {
            this.categories_reason = response.data;
            }) /* axios */
      }, /* updateCategoriesReason */
      updateCategoriesDefect() {
        axios
        .post('/get_categories_defect',)
        .then(response => {
            this.categories_defect = response.data;
            }) /* axios */
      }, /* updateCategoriesDefect */
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
      changePnr(event){
        if (this.newPnr === true){ 
          this.newSafety = false;
          this.newExploitation = false;
        }
      },
      clickbuttonmain () {
        this.isHiddenblockmain = 'false';
        this.isHiddenblockhistory = 'true';
        this.isHiddenblockclassification = 'true';
        this.backgroundMainButtonCCS = "btn-primary";
        this.backgroundHistoryButtonCCS = "btn-outline-primary";
        this.backgroundСlassificationButtonCCS = "btn-outline-primary";
      },
      clickbuttonhistory () {
        this.isHiddenblockmain = 'true';
        this.isHiddenblockhistory = 'false';
        this.isHiddenblockclassification = 'true';
        this.backgroundMainButtonCCS = "btn-outline-primary";
        this.backgroundHistoryButtonCCS = "btn-primary";
        this.backgroundСlassificationButtonCCS = "btn-outline-primary";
      },
      clickbuttonclassification () {
        this.isHiddenblockmain = 'true';
        this.isHiddenblockhistory = 'true';
        this.isHiddenblockclassification = 'false';
        this.backgroundMainButtonCCS = "btn-outline-primary";
        this.backgroundHistoryButtonCCS = "btn-outline-primary";
        this.backgroundСlassificationButtonCCS = "btn-primary";
      },

      clickbuttonspravochnik() {
        appVueSpravochnik.clicklinkpage1();
        appVueSpravochnik.parent_button_close_modal_name = 'closeModalAddDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindow'), {
          keyboard: false
        })
        myModal.show()
      }, /* clickbuttonspravochnik */

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
        else if (this.newCategoryDefect === 0) {
          Swal.fire({html:"<b>Категория дефекта должна быть заполнена!</b>", heightAuto: false});
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
                "defect_safety": this.newSafety,
                "defect_pnr": this.newPnr,
                "defect_exploitation": this.newExploitation,
                "defect_category_defect_id": this.newCategoryDefect,
                "defect_class_system": this.newClassSystemName !== '' ? this.newClassSystemName : null,
                "defect_core_reason_code": this.newCoreClassificationCode !== '0' ? this.newCoreClassificationCode : null,
                "defect_direct_reason_code": this.newDirectClassificationCode !== '' ? this.newDirectClassificationCode : null,
                "defect_direct_reason_name": this.newDirectClassificationName !== '' ? this.newDirectClassificationName : null,
              }
          )
          .then(response => {
              /* console.log(response.data); */
              Swal.fire({html:"<b>Дефект добавлен</b>", heightAuto: false}); 
              document.getElementById('closeModalAddDefect').click();
                })
          .catch(err => {
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка при добавлении дефекта. Обратитесь к администратору.</b>", heightAuto: false}); 
                console.log(err);
              }
          }) /* axios */
        } /* else */
      }, /* addNewDefect */

      },
      },
    ).mount('#vueAddDefect')

