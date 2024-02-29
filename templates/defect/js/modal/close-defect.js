const appCloseDefect = Vue.createApp({
    data() {
      return {
        defect_id: '0',
        defect_divisions: {},
        defect_type_defects: {},
        categories_reason: {},
        categories_defect: {},
        statuses_defect:{}, /* ['Зарегистрирован' - 0, 'Адресован' - 1, 'Назначен исполнитель' - 2, 'Принят в работу' - 3, 'Работы завершены' - 4, 
                                'Устранен' - 5, 'Не устранен' - 6, 'Требует решения' - 7, 'Отменен' - 8, 'Закрыт' - 9, 'Локализован' - 10,] */
        repair_managers: {},
        workers: {},
        toggle: 'false',
        isDisabledCloseDefect: false,
        cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */
        cardDefectID: 0, /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
        cardStatusDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardTypeDefectName: '', /* Для отображения ТИПА ДЕФЕКТА карточке  */
        cardKKS: '', /* Для отображения KKS в карточке  */
        cardSystemName: '', /* Для отображения НАЗВАНИЯ ОБОРУДОВАНИЯ в карточке  */
        cardDescription: '', /* Для отображения ОПИСАНИЕ ДЕФЕКТА в карточке  */
        cardLocation: '', /* Для отображения МЕСТОПОЛОЖЕНИЕ в карточке  */
        cardDivisionOwner: {}, /* Для отображения ПОДРАЗДЕЛЕНИЕ-ВЛАДЕЛЕЦ в карточке  */
        cardRegistrator: {}, /* Для отображения РЕГИСТРАТОР ДЕФЕКТА в карточке  */
        cardDateRegistration: '', /* Для отображения ДАТА РЕГИСТРАЦИИ в карточке  */
        cardRepairManager: {}, /* Для отображения РУКОВОДИТЕЛЬ РЕМОНТА в карточке  */
        cardDatePlannedFinish: '', /* Для отображения СРОК УСТРАНЕНИЯ в карточке  */
        cardPPR: false,
        cardWorker: {}, /* Для отображения ИСПОЛНИТЕЛЬ РЕМОНТА в карточке  */
        cardWorkerDescription: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
        cardChecker: {}, /* Для отображения ВЫПОЛНИЛ ПРОВЕРКУ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
        cardCheckerDescription: {}, /* Для отображения РЕЗУЛЬТАТ ПРОВЕРКИ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
        newRepairManager_id: 0, /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */
        newCoreClassificationCode: '0',
        newCoreClassificationName: '',
        newCategoryDefect_id: 0,
        newClassSystemName: '',
        newDirectClassificationCode: '',   
        newDirectClassificationName: '', 
        cardHistorys: getDataCardHistoryes(),        
        backgroundMainButtonCCS: "btn-primary",
        backgroundHistoryButtonCCS: "btn-outline-primary",
        backgroundСlassificationButtonCCS: "btn-outline-primary",
        isHiddenblockmain: 'false',
        isHiddenblockhistory: 'false',
        isHiddenblockclassification: 'false',
        cardSafety: false,
        cardPnr: false,
        cardExploitation: false,
        isHiddenDate: 'false',
      }
    },
    mounted() {
      this.setPopover();
      this.isHiddenblockhistory = 'true';
      this.isHiddenblockclassification  = 'true';
      updateCategoriesReason(this.categories_reason);
      updateCategoriesDefect(this.categories_defect);
    },
    methods: {
      setPopover(){
        $(document).ready(function(){
          if($("#closeCloseDefectButton").is(":disabled")) {
            $('[data-toggle="popover_close"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */
      updateTables() {
        updateTableDivision(this.defect_divisions);
        updateTableTypeDefect(this.defect_type_defects);
        updateTableStatusDefect(this.statuses_defect);
        updateTableHistory(this.defect_id, this.cardHistorys);
        updateTableRepairManagers(this.repair_managers);
        updateTableWorkers(this.workers);
        this.updateCardDefect();
        this.clickbuttonmain();
      }, /* updateTables */
      changeCoreClassificationCode(event){
        const categories_reason_array = Object.values(this.categories_reason);
        category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === event.target.value)
        this.newCoreClassificationName = category_reason[0].category_reason_name
      },
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
            this.cardKKS = this.cardDefect.defect_system.system_kks; 
            this.cardSystemName = this.cardDefect.defect_system.system_name; 
            this.cardDescription = this.cardDefect.defect_description;
            this.cardLocation = this.cardDefect.defect_location;
            this.cardDivisionOwner = this.cardDefect.defect_division.division_name;
            this.cardRegistrator = this.cardDefect.defect_registrar.user_surname + ' ' + this.cardDefect.defect_registrar.user_name;
            this.cardDateRegistration = this.cardDefect.defect_created_at;
            this.cardRepairManager = this.cardDefect.defect_repair_manager.user_surname + ' ' + this.cardDefect.defect_repair_manager.user_name;
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardPPR = this.cardDefect.defect_ppr;
            this.cardWorkerDescription = this.cardDefect.defect_work_comment;
            this.cardWorker = this.cardDefect.defect_worker.user_surname + ' ' + this.cardDefect.defect_worker.user_name;
            this.cardCheckerDescription = this.cardDefect.defect_check_result;
            this.cardChecker = this.cardDefect.defect_checker.user_surname + ' ' + this.cardDefect.defect_checker.user_name;
            this.isHiddenDate = this.cardDefect.defect_ppr === true ? 'true' : 'false' 
            this.cardSafety = this.cardDefect.defect_safety;
            this.cardPnr = this.cardDefect.defect_pnr;
            this.cardExploitation = this.cardDefect.defect_exploitation;
            this.newCategoryDefect_id = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : 0;
            this.newClassSystemName = this.cardDefect.defect_system_klass ? this.cardDefect.defect_system_klass : '';
            this.newCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : '0';
            const categories_reason_array = Object.values(this.categories_reason);
            category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === this.newCoreClassificationCode)
            this.newCoreClassificationName = category_reason.length !== 0 ? category_reason[0].category_reason_name : ''
            this.newDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : '';
            this.newDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : '';
            axios
            .post('/user/me')
            .then(response => {
                this.currentUser = response.data;
                this.currentUserDivision = this.currentUser.user_division;
                this.currentUserRole = this.currentUser.user_role;
                if (this.currentUserRole != 'Владелец' ){
                  this.isDisabledCloseDefect = true;
                } else if (this.currentUserDivision !== this.cardDivisionOwner ) {
                  this.isDisabledCloseDefect = true;
                } else { this.isDisabledCloseDefect = false;}
                if (this.currentUserRole == 'Администратор'){
                  this.isDisabledCloseDefect = false;
                }
              })
                })
          .catch(err => {
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
              }
          }) /* axios */
      }, /* updateCardDefect */
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
      closeDefect() {
        Swal.fire({
          title: "Закрыть дефект?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          old_defect_category_defect_id = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : this.cardDefect.defect_category_defect

          if (result.isConfirmed) {
            textHistory = ''
            if (this.newCategoryDefect_id !== old_defect_category_defect_id){
              textHistory = textHistory+'Категория дефекта изменилась с "'+old_defect_category_defect_id ? old_defect_category_defect_id : "НЕТ" +'" на "'+this.categories_defect[this.newCategoryDefect_id-1].category_defect_name+'"\n';
            }
            if (this.newClassSystemName !== this.cardDefect.defect_system_klass){
              textHistory = textHistory+'Класс оборудования изменился с "'+this.cardDefect.defect_system_klass+'" на "'+this.newClassSystemName+'"\n';
            }
            if (this.cardDefect.defect_core_category_reason !== null ? this.cardDefect.defect_core_category_reason.category_reason_code : '' !== this.newCoreClassificationCode){
              textHistory = textHistory+'Код категории коренной причины изменился с "'+(this.cardDefect.defect_core_category_reason !== null ? this.cardDefect.defect_core_category_reason.category_reason_code : '')+'" на "'+this.newCoreClassificationCode+'"\n';
            }
            if (this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_code : '' !== this.newDirectClassificationCode){
              textHistory = textHistory+'Код категории непосредственной причины изменился с "'+(this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_code : '')+'" на "'+this.newDirectClassificationCode+'"\n';
            }
            if (this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_name : '' !== this.newDirectClassificationName){
              textHistory = textHistory+'Код категории непосредственной причины изменился с "'+(this.cardDefect.defect_direct_category_reason !== null ? this.cardDefect.defect_direct_category_reason.category_reason_name : '')+'" на "'+this.newDirectClassificationName+'"\n';
            }
            data = { 
                  "defect_id": {
                    "defect_id": this.defect_id
                  },
                  "status_name": {
                    "status_defect_name": this.statuses_defect[9].status_defect_name
                  },
                  "category_defect_id": {
                    "category_defect_id": this.newCategoryDefect_id !== old_defect_category_defect_id ? this.newCategoryDefect_id : old_defect_category_defect_id
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
                                        this.newDirectClassificationCode !== '' ? this.newDirectClassificationCode : null :
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
            .post('/close_defect', data)
            .then(response => {
                document.getElementById('closeCloseDefectModalWindow').click();
                appVueDefect.updateTables()
                Swal.fire("ДЕФЕКТ ЗАКРЫТ", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ЗАКРЫТИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
          }
        });
      },/* closeDefect */
      cancelDefect() {
        appCorrectionDefect.defect_id = defect_id;
        appCorrectionDefect.parent_button_close_modal_name = 'closeCloseDefectModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CorrectionDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      },/* cancelDefect */
      exportHistoryExcel(){
        runExportHistoryExcel(this.defect_id);
      }, /* exportHistoryExcel */
      },
    }).mount('#vueCloseDefect')