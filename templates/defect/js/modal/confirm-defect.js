const appConfirmDefect = Vue.createApp({
    directives: {'maska': Maska.vMaska},
    data() {
      return {
        defect_conditions_equipment: {},
        defect_id: '0',
        categories_reason: {},
        categories_reason_direct: {}, 
        categories_defect: {},
        defect_divisions: {},
        defect_type_defects: {},
        statuses_defect:{}, /* ['Зарегистрирован' - 0, 'Адресован' - 1, 'Назначен исполнитель' - 2, 'Принят в работу' - 3, 'Работы завершены' - 4, 
                                'Устранен' - 5, 'Не устранен' - 6, 'Требует решения' - 7, 'Отменен' - 8, 'Закрыт' - 9, 'Локализован' - 10,] */
        repair_managers: {},
        workers: {},
        toggle: 'false',
        isDisabledConfirmDefect: false, 
        isDisabledConfirmDefect1: false, 
        isHiddenDate: 'false',
        check_repair_manager: false,
        check_date: false,
        isHiddenblockmain: 'false',
        isHiddenblockhistory: 'false',
        isHiddenblockclassification: 'false',
        placeholders: getDataPlaceholders(),
        modalConfirmDefectModalWindow: Vue.ref('modalConfirmDefectModalWindow'),
        cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */
        cardDefectID: 0, /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
        cardStatusDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardTypeDefectName: '', /* Для отображения ТИПА ДЕФЕКТА карточке  */
        cardConditionEquipmentName: '', /* Для отображения СОСТОЯНИЯ ОБОРУДОВАНИЯ карточке  */
        cardKKS: null, /* Для отображения KKS в карточке  */
        cardSystemName: '', /* Для отображения НАЗВАНИЯ ОБОРУДОВАНИЯ в карточке  */
        cardDescription: '', /* Для отображения ОПИСАНИЕ ДЕФЕКТА в карточке  */
        cardLocation: '', /* Для отображения МЕСТОПОЛОЖЕНИЕ в карточке  */
        cardRegistrator: {}, /* Для отображения РЕГИСТРАТОР ДЕФЕКТА в карточке  */
        cardDateRegistration: '', /* Для отображения ДАТА РЕГИСТРАЦИИ в карточке  */
        cardRepairManager: {}, /* Для отображения РУКОВОДИТЕЛЬ РЕМОНТА в карточке  */
        cardDatePlannedFinish: '', /* Для отображения СРОК УСТРАНЕНИЯ в карточке  */
        cardWorker: {}, /* Для отображения ИСПОЛНИТЕЛЬ РЕМОНТА в карточке  */
        cardWorkerDescription: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
        cardChecker: {}, /* Для отображения ВЫПОЛНИЛ ПРОВЕРКУ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
        cardCheckerDescription: {}, /* Для отображения РЕЗУЛЬТАТ ПРОВЕРКИ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
        newCardKKS: null,
        newCardLocation: '',
        newCardSystemName: '',
        newCardDescription: '',
        newCardDatePlannedFinish: '',
        newCardTypeDefectName: '',
        newCardConditionEquipmentName: '',
        newCoreClassificationCode: '',
        newCoreClassificationName: '',
        newCategoryDefect_id: 0,
        newClassSystemName: '',
        newDirectClassificationCode: '',   
        newDirectClassificationName: '',  
        newRepairManagerDivision: '',
        newRepairManager_id: '', /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */
        newDivisionOwner_id: 0, /* Для хранения ID ПОДРАЗДЕЛЕНИЯ-ВЛАДЕЛЕЦ  в карточке  */
        newSafety: false,
        newPnr: false,
        newExploitation: false,
        backgroundMainButtonCCS: "btn-primary",
        backgroundHistoryButtonCCS: "btn-outline-primary",
        backgroundСlassificationButtonCCS: "btn-outline-primary",
        cardHistorys: getDataCardHistoryes(),
        maskObject: {},
      }
    },
    beforeMount() {
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserRole = this.currentUser.user_role;
          if (!this.currentUserRole.includes('Администратор') && !this.currentUserRole.includes('Владелец')) {
            this.isDisabledConfirmDefect = true;
            this.isDisabledConfirmDefect1 = true;
          }
          if (this.currentUser.user_division != 'РусАС') {
            this.isDisabledConfirmDefect1 = true;
          }
        })
    },
    mounted() {
      this.setPopoverSafetyConfirmDefect()
      this.setPopoverExploitationConfirmDefect()
      this.setLimitNotes();
      this.setLimitSystem();
      this.setLimitLocation();
      this.setPopover();
      updateCategoriesReason(this.categories_reason);
      updateCategoriesReasonDirect(this.categories_reason_direct);
      updateCategoriesDefect(this.categories_defect);
      this.updateTableConditionEquipment();
      this.isHiddenblockhistory = 'true';
      this.isHiddenblockclassification  = 'true';
      var myModalEl = document.getElementById('ConfirmDefectModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appConfirmDefect.clearData();
        appConfirmDefect.setLimitNotes();
        appConfirmDefect.setLimitSystem();
        appConfirmDefect.setLimitLocation();
      })
    },
    methods: {
      setPopoverSafetyConfirmDefect(){
        $(document).ready(function(){
          $("#flexSafetyConfirm").focus(function () {
          if(appConfirmDefect.newSafety == false)  { 
            $('[data-toggle="popover_safety_confirm_defect"]').popover("show")
          } else {
            $('[data-toggle="popover_safety_confirm_defect"]').popover('dispose')
          } 
        }); 
      })
      },  /* setPopoverSafetyConfirmDefect */
      setPopoverExploitationConfirmDefect(){
        $(document).ready(function(){
          $("#flexExploitationConfirm").focus(function () {
          if(appConfirmDefect.newExploitation == false)  { 
            $('[data-toggle="popover_exploitation_confirm_defect"]').popover("show")
          } else {
            $('[data-toggle="popover_exploitation_confirm_defect"]').popover('dispose')
          } 
        }); 
      })
      }, /* setPopoverExploitationConfirmDefect */
      setLimitNotes(event){
        setLimit("my-notes-confirm", "notes-confirm", 200, this.newCardDescription)
      }, /* setLimitNotes */
      setLimitSystem(event){
        setLimit("my-system-confirm", "system-confirm", 100, this.newCardSystemName)
      }, /* setLimitSystem */
      setLimitLocation(event){
        setLimit("work-location-confirm", "location-confirm", 100, this.newCardLocation)
      }, /* setLimitLocation */
      setPopover(){
        $(document).ready(function(){
          if($("#confirmCancelDefectButton").is(":disabled") && $("#confirmConfirmDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_confirm"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */
      changeTextCorrection(event){
        this.newCardKKS = '';
        if (event.target.value) {this.style_input_type = "lime"};
      }, /* changeTextWork */
      changeTextWork40(event){
        if (event.target.value.length > 40) {event.target.value = event.target.value.slice(0, 40);}
      }, /* changeTextWork15 */
      changeTextWork100(event){
        if (event.target.value.length > 100) {event.target.value = event.target.value.slice(0, 100);}
      }, /* changeTextWork100 */
      changeTextWork200(event){
        if (event.target.value.length > 200) {event.target.value = event.target.value.slice(0, 200);}
      }, /* changeTextWork200 */
      changePnr(event){
        if (this.newPnr === true){ 
          this.newSafety = false;
          this.newExploitation = false;
          this.isHiddenDate = 'false'; 
        } else {
          this.newSafety = this.cardDefect.defect_safety;
          this.newExploitation = this.cardDefect.defect_exploitation;
        }
      },
      changeCoreClassificationCode(event){
        const categories_reason_array = Object.values(this.categories_reason); 
        category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === event.target.value)
        this.newCoreClassificationName = category_reason[0].category_reason_name
      },
      changeDirectClassificationCode(event){
        const categories_reason_array_direct = Object.values(this.categories_reason_direct); 
        category_reason_direct = categories_reason_array_direct.filter((category_reason_direct) => category_reason_direct.category_reason_code === event.target.value)
        this.newDirectClassificationName = category_reason_direct[0].category_reason_name
      },
      clearData() {
        this.newCardKKS = null; 
        this.newDivisionOwner_id = 0;
        this.newRepairManager_id = '';
        this.isHiddenDate = 'false';
        this.check_repair_manager = false;
        this.check_date = false;
        this.newCoreClassificationName = 0;
        this.newDirectClassificationName = 0;
        this.newCoreClassificationCode = '';
        this.newDirectClassificationCode = '';
      }, /* clearData */
      updateTables() {
        this.cardHistorys = getDataCardHistoryes();
        updateTableDivision(this.defect_divisions);
        updateTableTypeDefect(this.defect_type_defects);
        updateTableStatusDefect(this.statuses_defect);
        updateTableHistory(this.defect_id, this.cardHistorys);
        updateTableRepairManagers(this.repair_managers);
        updateTableWorkers(this.workers);
        this.updateCardDefect();
        this.check_date = false;
        this.clickbuttonmain();
      }, /* updateTables */   
      updateTableConditionEquipment() {
        axios
        .post('/condition_equipment',)
        .then(response => {
            this.defect_conditions_equipment = response.data;
              }) /* axios */
      }, /* updateTableConditionEquipment */
      updateCardDefect() {
        axios
          .post('/get_defect/',{
            "defect_id": this.defect_id,
          })
          .then(response => {
            this.cardDefect = response.data;
            this.cardDefectID = this.cardDefect.defect_id; 
            this.cardStatusDefectName = this.cardDefect.defect_status.status_defect_name; 
            this.cardTypeDefectName = this.cardDefect.defect_type.type_defect_name; 
            this.cardConditionEquipmentName = this.cardDefect.defect_condition_equipment.condition_equipment_name;
            this.cardKKS = this.cardDefect.defect_system.system_kks;
            this.cardSystemName = this.cardDefect.defect_system.system_name; 
            this.cardDescription = this.cardDefect.defect_description;
            this.cardLocation = this.cardDefect.defect_location;
            this.cardRegistrator = this.cardDefect.defect_registrar.user_surname + ' ' + this.cardDefect.defect_registrar.user_name + ' (' + this.cardDefect.defect_registrar.user_division.division_name + ')';
            /* this.cardRegistrator = this.cardDefect.defect_registrar.user_surname + ' ' + this.cardDefect.defect_registrar.user_name + ' (' 
            + this.cardDefect.defect_registrar.user_division.division_name + ')'; */
            this.cardDateRegistration = this.cardDefect.defect_created_at;
            this.cardRepairManager = this.cardDefect.defect_repair_manager;
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardWorker = this.cardDefect.defect_worker ? this.cardDefect.defect_worker.user_surname + ' ' + this.cardDefect.defect_worker.user_name : "";
            this.cardChecker = this.cardDefect.defect_checker ? this.cardDefect.defect_checker.user_surname + ' ' + this.cardDefect.defect_checker.user_name : "";
            this.cardCheckerDescription = this.cardDefect.defect_check_result;
            
            this.repairManager_id = this.cardDefect.defect_repair_manager ? this.cardDefect.defect_repair_manager.user_id : '';
            this.divisionOwner_id = this.cardDefect.defect_division ? this.cardDefect.defect_division.division_id : 0;
            this.isHiddenDate = this.cardDefect.defect_ppr === true ? 'true' : 'false' 
            this.newCardLocation = this.cardLocation;
            this.newCardSystemName = this.cardSystemName; 
            this.newCardDescription = this.cardDescription;
            this.newRepairManager_id = this.repairManager_id; //
            this.newCardDatePlannedFinish = this.cardDatePlannedFinish; //
            this.newCardTypeDefectName = this.cardTypeDefectName; //
            this.newCardConditionEquipmentName = this.cardConditionEquipmentName;
            this.newCardKKS = this.cardKKS;
            this.newDivisionOwner_id = this.divisionOwner_id;
            this.newSafety = this.cardDefect.defect_safety;
            this.newPnr = this.cardDefect.defect_pnr;
            this.newExploitation = this.cardDefect.defect_exploitation;
            this.cardWorkerDescription = this.cardDefect.defect_work_comment;
            this.newCategoryDefect_id = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : 0;
            this.newClassSystemName = this.cardDefect.defect_system_klass ? this.cardDefect.defect_system_klass : '';

            this.newCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : '';
            const categories_reason_array = Object.values(this.categories_reason); 
            category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === this.newCoreClassificationCode)
            this.newCoreClassificationName = category_reason.length !== 0 ? category_reason[0].category_reason_name : ''

            this.newDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : '';
            const categories_reason_array_direct = Object.values(this.categories_reason_direct); 
            category_reason_direct = categories_reason_array_direct.filter((category_reason_direct) => category_reason_direct.category_reason_code === this.newDirectClassificationCode)
            this.newDirectClassificationName = category_reason_direct.length !== 0 ? category_reason_direct[0].category_reason_name : ''
            /* this.newDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : ''; */

            this.setLimitNotes();
            this.setLimitSystem();
            this.setLimitLocation();
                })
          .catch(err => {
              console.log(err)
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
              }
          }) /* axios */
      }, /* updateCardDefect */
      checkMask(){
        this.maskObject.completed = this.newCardKKS.length >= this.placeholders[this.newCardTypeDefectName].slice(0,11).length
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
      clickButtonSpravochnikCore() {
        appVueSpravochnikCore.clicklinkpage1();
        appVueSpravochnikCore.parent_button_close_modal_name = 'closeModalConfirmDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindowCore'), {
          keyboard: false
        })
        appVueSpravochnikCore.parentVueObject = this;
        appVueSpravochnikDirect.parentVueObject = this;
        myModal.show()
      }, /* clickbuttonspravochnikcore */
       clickButtonSpravochnikDirect() {
        appVueSpravochnikDirect.parent_button_close_modal_name = 'closeModalConfirmDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindowDirect'), {
          keyboard: false
        })
        appVueSpravochnikCore.parentVueObject = this;
        appVueSpravochnikDirect.parentVueObject = this;
        myModal.show()
      }, /* clickbuttonspravochnikdirect */
      confirmDefect() {
        if (this.currentUser.user_division != this.cardDefect.defect_division.division_name && !this.currentUserRole.includes('Администратор')
          /* && this.currentUser.user_division != 'РусАС' */) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDefect.defect_division.division_name  + "'</b>", heightAuto: false}); 
          return;  
        }   
        if (this.newCardKKS == '') {
          Swal.fire({html:"<b>Код KKS или номенклатурный номер не введен!</b>", heightAuto: false});
          return; /* Если KKS не заполнены то выходим из функции */
        }  
        if ((this.newCardKKS.includes('AKK-SAHA') && this.newCardKKS.length < 12) || (this.newCardKKS.includes('AKK-SAHA') && this.newCardKKS.length > 15)) {
          Swal.fire({html:"<b>Номенклатурный номер AKK-SAHA должен иметь от 4 до 7 цифр!</b>", heightAuto: false});
          return; /* Если номенклатурный номер меньше 12 илли больше 15 символов */
        }  
        if (this.newCardKKS.includes('AKK-SAHA') && (
          isNaN(parseInt(this.newCardKKS[8])) || 
          isNaN(parseInt(this.newCardKKS[9])) || 
          isNaN(parseInt(this.newCardKKS[10])) || 
          isNaN(parseInt(this.newCardKKS[11])))) {
          Swal.fire({html:"<b>После AKK-SAHA введены не цифры!</b>", heightAuto: false});
          return;
        }  
        if ((this.newCardKKS.includes('AKK-SAHA') && this.newCardKKS.length > 12) && 
          (isNaN(parseInt(this.newCardKKS[12])))){
          Swal.fire({html:"<b>После AKK-SAHA должны быть цифры!</b>", heightAuto: false});
          return;
        }  
        if ((this.newCardKKS.includes('AKK-SAHA') && this.newCardKKS.length > 13) && 
          (isNaN(parseInt(this.newCardKKS[13])))){
          Swal.fire({html:"<b>После AKK-SAHA должны быть цифры!</b>", heightAuto: false});
          return;
        }  
        if ((this.newCardKKS.includes('AKK-SAHA') && this.newCardKKS.length > 14) && 
          (isNaN(parseInt(this.newCardKKS[14])))){
          Swal.fire({html:"<b>После AKK-SAHA должны быть цифры!</b>", heightAuto: false});
          return;
        } 
        if (this.newCardDatePlannedFinish == null && this.isHiddenDate == 'false') {
          this.check_date = true;
          Swal.fire({html:"<b>Срок устранения должен быть заполнен или переключатель 'Будет устранен в ППР' должен быть включен!</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }
        if (this.newRepairManager_id == '') {
          this.check_repair_manager = true;
          Swal.fire({html:"<b>Поле 'Ответственный за уcтранение' должно быть заполнено!</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }

        /* const repair_managers_array = Object.values(this.repair_managers); 
        this.newRepairManagerDivision = repair_managers_array.filter((user) => user.user_id === this.newRepairManager_id)
        if (this.currentUser.user_division != this.newRepairManagerDivision[0].user_division) {
          Swal.fire({html:"<b>Ответственный за устранение должен быть из подразделения '" + this.defect_divisions[this.newDivisionOwner_id-1].division_name + "' </b>", heightAuto: false}); 
          return;  
        }  Эта проверка в данный момент не нужна, но может понадобиться в будущем */ 

        if (this.newCardSystemName == '' || this.newCardDescription == '') {
          Swal.fire({html:"<b>Заполните все необходимые поля. Укажите руководителя ремонта и срок устранения.</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }
        
        /* if ((this.cardKKS !== '' && this.newCardKKS !== '' && this.newCardKKS !== null) && this.placeholders[this.newCardTypeDefectName] === '##XXX##XN##AAAAAA') {
          this.checkMask()
        }
        
        if ((this.cardKKS !== '' && this.newCardKKS !== '' && this.newCardKKS !== null) && !this.maskObject.completed) {
          Swal.fire({html:"<b>KKS введен не полностью!</b>", heightAuto: false});
          return;
        } */
        /* if (this.newDirectClassificationName === '' && this.newDirectClassificationCode !== '') {
          Swal.fire({html:"<b>Причина события в разделе 'Непосредственная причина события' должна быть заполнена!</b>", heightAuto: false});
          return;
        } */
        tempDate = this.cardDateRegistration.split(' ')[0].split('-')
        cardDateRegistration = tempDate[2] + '-'+tempDate[1]+'-'+tempDate[0]
        if (this.newCardDatePlannedFinish < cardDateRegistration ) {
          Swal.fire({html:"<b>Срок устранения должен быть позже даты регистрации дефекта</b>", heightAuto: false}); 
          return;  /* Если планируемая дата меньше даты то выходим из функции */
        }
        Swal.fire({
          title: "Вы действительно хотите подтвердить дефект?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          const repair_managers_array = Object.values(this.repair_managers); 
          repairManager = this.repairManager_id != 0 ? this.repair_managers[repair_managers_array.findIndex(p => p.user_id == this.repairManager_id)].user_surname+' '+this.repair_managers[repair_managers_array.findIndex(p => p.user_id == this.repairManager_id)].user_name : ''
          newRepairManager = this.newRepairManager_id != 0 ? this.repair_managers[repair_managers_array.findIndex(p => p.user_id == this.newRepairManager_id)].user_surname+' '+this.repair_managers[repair_managers_array.findIndex(p => p.user_id == this.newRepairManager_id)].user_name : ''

          if (result.isConfirmed) {
            let textHistory = '';
            const oldCategoryDefectId = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : null;
            const oldClassSystemName = this.cardDefect.defect_system_klass;
            const oldCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : null;
            const oldCoreClassificationName = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_name : "НЕТ";
            const oldDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : null;
            const oldDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : "НЕТ";
            
            if (this.newCardTypeDefectName !== this.cardTypeDefectName){
              textHistory = textHistory+'Тип дефекта изменился с "'+this.cardTypeDefectName+'" на "'+this.newCardTypeDefectName+'"\n';
            }
            if (this.newCardKKS !== this.cardKKS){
              textHistory = textHistory+'KKS изменился с "'+(this.cardKKS ? this.cardKKS : "")+'" на "'+(this.newCardKKS ? this.newCardKKS : "")+'"\n';
            }
            if (this.newCardConditionEquipmentName !== this.cardConditionEquipmentName){
              textHistory = textHistory+'Состояние оборудования изменилось с "'+this.cardConditionEquipmentName+'" на "'+this.newCardConditionEquipmentName+'"\n';
            }
            if (this.newCardLocation !== this.cardLocation){
              textHistory = textHistory+'Местоположение изменилось с "'+(this.cardLocation ? this.cardLocation : "")+'" на "'+(this.newCardLocation ? this.newCardLocation : "")+'"\n';
            }
            if (this.newCardDescription !== this.cardDescription){
              textHistory = textHistory+'Описание дефекта изменилось с "'+this.cardDescription+'" на "'+this.newCardDescription+'"\n';
            }
            if (this.newDivisionOwner_id !== this.divisionOwner_id){
              textHistory = textHistory+'Подразделение-владелец изменилось с "'+this.defect_divisions[this.divisionOwner_id-1].division_name+'" на "'+this.defect_divisions[this.newDivisionOwner_id-1].division_name+'"\n';
            }
            if (this.newCardSystemName !== this.cardSystemName){
              textHistory = textHistory+'Оборудование изменилось с "'+this.cardSystemName+'" на "'+this.newCardSystemName+'"\n';
            }
            if (this.newRepairManager_id !== this.repairManager_id && this.cardStatusDefectName !== 'Зарегистрирован'){
              textHistory = textHistory+'Ответственный за устранение изменился с "'+repairManager+'" на "'+newRepairManager+'"\n';
            } else {
              textHistory = textHistory+'Назначен ответственный за устранение: '+newRepairManager+'\n';
            }
            if (this.cardDefect.defect_safety !== this.newSafety){
              textHistory = textHistory+'Влияет на безопасность и несение нагрузки изменился с "'+(this.cardDefect.defect_safety ? "ДА": "НЕТ")+'" на "'+(this.newSafety ? "ДА": "НЕТ")+'"\n';
            }
            if (this.cardDefect.defect_pnr !== this.newPnr){
              textHistory = textHistory+'В ПНР изменился с "'+(this.cardDefect.defect_pnr ? "ДА": "НЕТ")+'" на "'+(this.newPnr ? "ДА": "НЕТ")+'"\n';
            }
            if (this.cardDefect.defect_exploitation !== this.newExploitation){
              textHistory = textHistory+'Влияет на режим нормальной эксплуатации изменился с "'+(this.cardDefect.defect_exploitation ? "ДА": "НЕТ")+'" на "'+(this.newExploitation ? "ДА": "НЕТ")+'"\n';
            }
            if (this.newCategoryDefect_id !== oldCategoryDefectId && this.newCategoryDefect_id !== 0) {
              const oldCategoryDefectName = oldCategoryDefectId ? this.categories_defect[oldCategoryDefectId - 1].category_defect_name : "НЕТ";
              const newCategoryDefectName = this.categories_defect[this.newCategoryDefect_id - 1].category_defect_name;
              textHistory += `Категория дефекта изменилась с "${oldCategoryDefectName}" на "${newCategoryDefectName}"\n`;
            }
        
            if ((this.newClassSystemName !== oldClassSystemName && this.newClassSystemName !== '') || (!oldClassSystemName && this.newClassSystemName !== '')) {
                if (oldClassSystemName) {
                    textHistory += `Класс оборудования изменился с "${oldClassSystemName}" на "${this.newClassSystemName}"\n`;
                } else {
                    textHistory += `Класс оборудования был добавлен: "${this.newClassSystemName}"\n`;
                }
            }
        
            if (this.newCoreClassificationCode && this.newCoreClassificationName && (this.newCoreClassificationCode !== oldCoreClassificationCode || this.newCoreClassificationName !== oldCoreClassificationName)) {
                if (oldCoreClassificationCode !== null || oldCoreClassificationName !== "НЕТ") {
                    textHistory += `Коренная причина дефекта изменилась с "${oldCoreClassificationCode} ${oldCoreClassificationName}" на "${this.newCoreClassificationCode} ${this.newCoreClassificationName}"\n`;
                } else {
                    textHistory += `Коренная причина дефекта была добавлена: "${this.newCoreClassificationCode} ${this.newCoreClassificationName}"\n`;
                }
            }
        
            if (this.newDirectClassificationCode && this.newDirectClassificationName && (this.newDirectClassificationCode !== oldDirectClassificationCode || this.newDirectClassificationName !== oldDirectClassificationName)) {
                if (oldDirectClassificationCode !== null || oldDirectClassificationName !== "НЕТ") {
                    textHistory += `Непосредственная причина дефекта изменилась с "${oldDirectClassificationCode} ${oldDirectClassificationName}" на "${this.newDirectClassificationCode} ${this.newDirectClassificationName}"\n`;
                } else {
                    textHistory += `Непосредственная причина дефекта была добавлена: "${this.newDirectClassificationCode} ${this.newDirectClassificationName}"\n`;
                }
            }
            if (this.cardDatePlannedFinish !== this.newCardDatePlannedFinish && this.cardStatusDefectName == 'Требует решения'){
              if (this.cardDatePlannedFinish === null){
                textHistory = textHistory+'Срок устранения изменился с "Устранить в ППР" на "'+this.newCardDatePlannedFinish+'"\n';
              } else {
                textHistory = textHistory+'Срок устранения изменился с "'+this.cardDatePlannedFinish+'" на "'+this.newCardDatePlannedFinish+'"\n';
              }
            } else {
              if (this.isHiddenDate === 'true' && this.cardDefect.defect_ppr !== true ) {
                textHistory = textHistory+'Срок устранения изменился с "'+this.cardDatePlannedFinish+'" на "Устранить в ППР"\n';
              }
            }
            data = {
              "defect_id": {
                "defect_id": this.defect_id
              },
              "status_name": {
                "status_defect_name": this.statuses_defect[1].status_defect_name
              },
              "repair_manager_id": {
                "user_id": this.newRepairManager_id
              },
              "defect_planned_finish_date_str": {
                "date": this.isHiddenDate == 'false' ? this.newCardDatePlannedFinish : null
              },
              "defect_ppr": {
                "ppr": this.isHiddenDate == 'true' ? true : false
              },
              "defect_pnr": {
                "pnr": this.newPnr
              },
              "defect_safety": {
                "safety": this.newSafety
              },
              "defect_exploitation": {
                "exploitation": this.newExploitation
              },
              "division_id": {
                "division_id": parseInt(this.newDivisionOwner_id)
              },
              "system_kks": {
                "system_kks": this.newCardKKS !== this.cardKKS ? this.newCardKKS : this.cardKKS
              },
              "system_name": {
                "system_name": this.newCardSystemName !== this.cardSystemName ? this.newCardSystemName : this.cardSystemName
              },
              "location": {
                "defect_location": this.newCardLocation !== this.cardLocation ? this.newCardLocation : null
              },
              "defect_description": {
                "defect_description": this.newCardDescription !== this.cardDescription ? this.newCardDescription : null
              },
              "type_defect_name": {
                "type_defect_name": this.newCardTypeDefectName !== this.cardTypeDefectName ? this.newCardTypeDefectName : null
              },
              "condition_equipment_name": {
                "condition_equipment_name": this.newCardConditionEquipmentName !== this.cardConditionEquipmentName ? this.newCardConditionEquipmentName : null
              },
              "category_defect_id": {
                "category_defect_id": this.newCategoryDefect_id !== oldCategoryDefectId ? this.newCategoryDefect_id : oldCategoryDefectId
              },
              "class_system_name": {
                "class_system_name": this.newClassSystemName !== this.cardDefect.defect_system_klass ?
                                     this.newClassSystemName !== '' ? this.newClassSystemName : null:
                                     this.cardDefect.defect_system_klass !== null ? this.cardDefect.defect_system_klass : null
              },
              "core_classification_code": {
                "core_rarery_code": (this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : '') !== this.newCoreClassificationCode ?
                                    this.newCoreClassificationCode !== '0' ? this.newCoreClassificationCode : null :
                                    this.cardDefect.defect_core_category_reason !== null ? this.cardDefect.defect_core_category_reason.category_reason_code : null
              },
              "direct_classification_code": {
                "direct_rarery_code": (this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : '') !== this.newDirectClassificationCode ?
                                    this.newDirectClassificationCode !== '0' ? this.newDirectClassificationCode : null :
                                    this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_name : null
              },
              "direct_classification_name": {
                "direct_rarery_name": (this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : '') !== this.newDirectClassificationName ?
                                    this.newDirectClassificationName !== '' ? this.newDirectClassificationName : null :
                                    this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_name : null
              },
              "comment": {
                "comment": textHistory !== '' ? textHistory : null
              }
            }
            axios
            .post('/confirm_defect', data)
            .then(response => {
                document.getElementById('closeConfirmDefectModalWindow').click();
                appVueFilter.useFilter()
                Swal.fire("Дефект подтвержден", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401){
                      
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ПОДТВЕРЖДЕНИИ ДЕФЕКТА. Обратитесь к администратору.</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
          }
        });
      },/* confirmDefect */
      cancelDefect() {
        if ((this.currentUser.user_division != this.defect_divisions[this.newDivisionOwner_id-1].division_name) &&
            !this.currentUserRole.includes('Администратор')) {
          this.check_checker_name = true;
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.defect_divisions[this.newDivisionOwner_id-1].division_name  + "'</b>", heightAuto: false}); 
          return;  /* Если дефект чужой, то выходим из функции */
        }


        appCancelDefect.defect_id = this.defect_id;
        appCancelDefect.parent_button_close_modal_name = 'closeConfirmDefectModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CancelDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()


        /* Swal.fire({
          title: "Вы действительно хотите отменить дефект?",
          showDenyButton: true,
          confirmButtonText: "ДА",
          denyButtonText: `НЕТ`
        }).then((result) => {
          if (result.isConfirmed) {
            data = {"defect_id": {"defect_id": this.defect_id},"status_name": {"status_defect_name": this.statuses_defect[8].status_defect_name}}
            axios
            .post('/update_status_defect', data)
            .then(response => {
                document.getElementById('closeConfirmDefectModalWindow').click();
                appVueFilter.useFilter()
                Swal.fire("ДЕФЕКТ ОТМЕНЕН", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ОТМЕНЫ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    } 
                }) 
            }
        }); */

      },/* cancelDefect */
      exportHistoryExcel(){
        runExportHistoryExcel(this.defect_id);
      }, /* exportHistoryExcel */
      },
    }).mount('#vueConfirmDefect')