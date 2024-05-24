const appVueAddDefect = Vue.createApp({
    directives: {'maska': Maska.vMaska},
    data() {
      return {
        defect_divisions: {},
        defect_type_defects: {},
        categories_reason: {},
        categories_defect: {},
        vueAddUserModalWindow: Vue.ref('vueAddUserModalWindow'),
        placeholders: getDataPlaceholders(),
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
      this.setPopoverSafetyAddDefect()
      this.setPopoverExploitationAddDefect()
      this.setLimitNotes()
      this.setLimitSystem()
      this.setLimitLocation()
      this.getDivision();
      updateCategoriesReason(this.categories_reason);
      updateCategoriesDefect(this.categories_defect);
      this.updateTableDivision();
      this.updateTableTypeDefect();
      this.isHiddenblockclassification  = 'true';
      var myModalEl = document.getElementById('AddDefectModalWindow');
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appVueAddDefect.clearData();
        appVueAddDefect.style_input_type = "#dee2e6";
        // appVueDefect.updateTables(); // Что это?! - Ответ: Это обновление основной таблицы в main-table.js при закрытии модального окна
        appVueAddDefect.updateTables();
        appVueAddDefect.setLimitNotes();
        appVueAddDefect.setLimitSystem();
        appVueAddDefect.setLimitLocation();
    })
    },
    methods: {
      setPopoverSafetyAddDefect(){
        $(document).ready(function(){
          $("#flexSafetyAddDefect").focus(function () {
          if(appVueAddDefect.newSafety == false)  { 
            $('[data-toggle="popover_safety_add_defect"]').popover("show")
          } else {
            $('[data-toggle="popover_safety_add_defect"]').popover('dispose')
          } 
        }); 
      })
      },  /* setPopoverSafetyAddDefect */
      setPopoverExploitationAddDefect(){
        $(document).ready(function(){
          $("#flexExploitationAddDefect").focus(function () {
          if(appVueAddDefect.newExploitation == false)  { 
            $('[data-toggle="popover_exploitation_add_defect"]').popover("show")
          } else {
            $('[data-toggle="popover_exploitation_add_defect"]').popover('dispose')
          } 
        }); 
      })
      }, /* setPopoverExploitationAddDefect */
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
      changeTextWork40(event){
        if (event.target.value.length > 40){
          event.target.value = event.target.value.slice(0, 40);
        }
      }, /* changeTextWork40 */
      setLimitNotes(event){
        setLimit("my-notes", "notes", 200)
      }, /* setLimitNotes */
      setLimitSystem(event){
        setLimit("my-system", "system", 100)
      }, /* setLimitSystem */
      setLimitLocation(event){
        setLimit("work-location", "location", 100)
      }, /* setLimitLocation */
      changeCoreClassificationCode(event){
        const categories_reason_array = Object.values(this.categories_reason);
        category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === event.target.value)
        this.newCoreClassificationName = category_reason[0].category_reason_name
      },
      changeTextCorrection(event){
        this.newSystemKKS = ''
        if (event.target.value){ this.style_input_type = "lime"};
      }, /* changeTextWork */
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
        setSettingClickButtonMain(this)
      },
      clickbuttonhistory () {
        setSettingClickButtonHistory(this)
      },
      clickbuttonclassification () {
        setSettingClickButtonClassification(this)
      },
      clickbuttonspravochnik() {
        appVueSpravochnik.clicklinkpage1();
        appVueSpravochnik.parent_button_close_modal_name = 'closeModalAddDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindow'), {
          keyboard: false
        })
        myModal.show()
      }, /* clickbuttonspravochnik */
      AKK_SAHA () {
        if (this.newTypeDefect=='0'){ 
          Swal.fire({html:"<b>Журнал дефекта должен быть заполнен!</b>", heightAuto: false}); 
        } else {
          this.newSystemKKS = 'AKK-SAHA';
        }
      }, /* AKK_SAHA */  
      addNewDefect() {
        /* if (this.placeholders[this.newTypeDefect] === '##XXX##XN##AAAAAA') {
          this.checkMask()
        } */
        if (this.newTypeDefect == '0'){
          this.style_input_type = "#ff2851"
          this.check_defect_type = true
          Swal.fire({html:"<b>Журнал дефекта должен быть заполнен!</b>", heightAuto: false}); 
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
          Swal.fire({html:"<b>Все значения (кроме Местоположения) должны быть заполнены!</b>", heightAuto: false}); 
        } /* else if */
        else if (this.newSystemKKS == '' ) {
          Swal.fire({html:"<b>Код KKS или номенклатурный номер не введен!</b>", heightAuto: false});
        }  
        else if ((this.newSystemKKS.includes('AKK-SAHA') && this.newSystemKKS.length < 12) || (this.newSystemKKS.includes('AKK-SAHA') && this.newSystemKKS.length > 15)) {
          Swal.fire({html:"<b>Номенклатурный номер AKK-SAHA должен иметь от 4 до 7 цифр!</b>", heightAuto: false});
        }  
        else if (this.newSystemKKS.includes('AKK-SAHA') && (
        isNaN(parseInt(this.newSystemKKS[8])) || 
        isNaN(parseInt(this.newSystemKKS[9])) || 
        isNaN(parseInt(this.newSystemKKS[10])) || 
        isNaN(parseInt(this.newSystemKKS[11])))) {
          Swal.fire({html:"<b>После AKK-SAHA введены не цифры!</b>", heightAuto: false});
        }  
        /* else if (this.newSystemKKS !== '' && !this.maskObject.completed) {
          Swal.fire({html:"<b>Код KKS введен не полностью!</b>", heightAuto: false});
        }  */
        /*else if (this.newCategoryDefect === 0) {
          Swal.fire({html:"<b>Категория дефекта должна быть заполнена!</b>", heightAuto: false});
        }  */
        else {
          axios
          .post('/defect/add', 
              {
                "defect_description": this.newDefectNotes,
                "defect_system_name": this.newSystemName,
                "defect_system_kks": this.newSystemKKS !== '' ? this.newSystemKKS : null,
                "defect_type_defect_name": this.newTypeDefect,
                "defect_location": this.newLocation,
                "defect_user_division_id": this.newDivisionOwner_id,
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
              Swal.fire({html:"<b>Дефект добавлен</b>", heightAuto: false}); 
              document.getElementById('closeModalAddDefect').click();
              appVueFilter.useFilter();
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