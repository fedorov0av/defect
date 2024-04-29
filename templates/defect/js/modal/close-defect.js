const appCloseDefect = Vue.createApp({
    data() {
      return {
        defect_id: '0',
        defect_divisions: {},
        defect_type_defects: {},
        categories_reason: {},
        categories_reason_direct: {},
        categories_defect: {},
        statuses_defect:{}, /* ['Зарегистрирован' - 0, 'Адресован' - 1, 'Назначен исполнитель' - 2, 'Принят в работу' - 3, 'Работы завершены' - 4, 
                                'Устранен' - 5, 'Не устранен' - 6, 'Требует решения' - 7, 'Отменен' - 8, 'Закрыт' - 9, 'Локализован' - 10,] */
        repair_managers: {},
        workers: {},
        toggle: 'false',
        isDisabledCloseDefect: false,
        isDisabledCloseDefect1: false,
        isDisabledCloseDefect2: false,
        isDisabledFinishDefect: false,
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
        newCategoryDefect_id: 0,
        newClassSystemName: '',
        newCoreClassificationCode: '',
        newCoreClassificationName: '',
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
      updateCategoriesReasonDirect(this.categories_reason_direct);
      updateCategoriesDefect(this.categories_defect);
    },
    methods: {
      /*setPopover(){
        $(document).ready(function(){
          if($("#closeCloseDefectButton").is(":disabled")) {
            $('[data-toggle="popover_close"]').popover({
            placement : 'top'
          });
          }
        });
      },  setPopover */
      setPopover(){
        $(document).ready(function(){
          if($("#closeCheckDefectButton1"))  {
            $('[data-toggle="popover_close"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */
      updateTables() {
        this.cardHistorys = getDataCardHistoryes();
        updateTableDivision(this.defect_divisions);
        updateTableTypeDefect(this.defect_type_defects);
        updateTableStatusDefect(this.statuses_defect);
        updateTableHistory(this.defect_id, this.cardHistorys);
        updateTableRepairManagers(this.repair_managers);
        updateTableWorkers(this.workers);
        this.updateCardDefect();
        this.clickbuttonmain();
      }, /* updateTables */
      changeTextWork40(event){
        if (event.target.value.length > 40) {event.target.value = event.target.value.slice(0, 40);}
      }, /* changeTextWork15 */
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
            
            this.newCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : '';
            const categories_reason_array = Object.values(this.categories_reason);
            category_reason = categories_reason_array.filter((category_reason) => category_reason.category_reason_code === this.newCoreClassificationCode)
            this.newCoreClassificationName = category_reason.length !== 0 ? category_reason[0].category_reason_name : ''
            
            this.newDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : '';
            const categories_reason_array_direct = Object.values(this.categories_reason_direct); 
            category_reason_direct = categories_reason_array_direct.filter((category_reason_direct) => category_reason_direct.category_reason_code === this.newDirectClassificationCode)
            this.newDirectClassificationName = category_reason_direct.length !== 0 ? category_reason_direct[0].category_reason_name : ''
            /* this.newDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : ''; */
            
            if (this.cardStatusDefectName  != 'Локализован'){
              this.isDisabledCloseDefect2 = true;
            } else {
              this.isDisabledCloseDefect2 = false;
            }

            axios
            .post('/user/me')
            .then(response => {
                this.currentUser = response.data;
                this.currentUserDivision = this.currentUser.user_division;
                this.currentUserRole = this.currentUser.user_role;
                if (!this.currentUserRole.includes('Владелец') && !this.currentUserRole.includes('Администратор')){
                  this.isDisabledCloseDefect = true;
                } else if (this.currentUserDivision !== this.cardDivisionOwner ) {
                  this.isDisabledCloseDefect = true;
                } else { this.isDisabledCloseDefect = false;}
                if (!this.currentUserRole.includes('Администратор')){
                  this.isDisabledCloseDefect = false;
                }
                if (!this.currentUserRole.includes('Администратор')){
                  this.isDisabledCloseDefect1 = true;
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
      clickButtonSpravochnikCore() {
        appVueSpravochnikCore.clicklinkpage1();
        appVueSpravochnikCore.parent_button_close_modal_name = 'closeModalCloseDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindowCore'), {
          keyboard: false
        })
        appVueSpravochnikCore.parentVueObject = this;
        appVueSpravochnikDirect.parentVueObject = this;
        myModal.show()
      }, /* clickButtonSpravochnikCore */
      clickButtonSpravochnikDirect() {
        appVueSpravochnikDirect.parent_button_close_modal_name = 'closeModalCloseDefect';
        var myModal = new bootstrap.Modal(document.getElementById('SpavochnikModalWindowDirect'), {
          keyboard: false
        })
        appVueSpravochnikCore.parentVueObject = this;
        appVueSpravochnikDirect.parentVueObject = this;
        myModal.show()
      }, /* clickButtonSpravochnikDirect */
      closeDefect() {
        if (this.currentUser.user_division != this.cardDivisionOwner && !this.currentUserRole.includes('Администратор')
          /* && this.currentUser.user_division != 'РусАС' */) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDivisionOwner  + "'</b>", heightAuto: false}); 
          return;  
        }   
        Swal.fire({
          title: "Закрыть дефект?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА` 
        }).then((result) => {
          if (result.isConfirmed) {
            let textHistory = '';
            const oldCategoryDefectId = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : null;
            const oldClassSystemName = this.cardDefect.defect_system_klass;
            const oldCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : null;
            const oldCoreClassificationName = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_name : "НЕТ";
            const oldDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : null;
            const oldDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : "НЕТ";
        
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
            data = {
                "defect_id": {
                    "defect_id": this.defect_id
                },
                "status_name": {
                    "status_defect_name": this.statuses_defect[9].status_defect_name
                },
                "category_defect_id": {
                    "category_defect_id": this.newCategoryDefect_id !== oldCategoryDefectId ? this.newCategoryDefect_id : oldCategoryDefectId
                },
                "class_system_name": {
                    "class_system_name": this.newClassSystemName !== oldClassSystemName ? (this.newClassSystemName !== '' ? this.newClassSystemName : null) : (oldClassSystemName !== null ? oldClassSystemName : null)
                },
                "core_classification_code": {
                    "core_rarery_code": this.newCoreClassificationCode !== oldCoreClassificationCode ? (this.newCoreClassificationCode !== '' ? this.newCoreClassificationCode : null) : (oldCoreClassificationCode !== null ? oldCoreClassificationCode : null)
                },
                "direct_classification_code": {
                    "direct_rarery_code": this.newDirectClassificationCode !== oldDirectClassificationCode ? (this.newDirectClassificationCode !== '' ? this.newDirectClassificationCode : null) : (oldDirectClassificationCode !== null ? oldDirectClassificationCode : null)
                },
                "comment": {
                    "comment": textHistory !== '' ? textHistory : null
                }
              };
            axios
            .post('/close_defect', data)
            .then(response => {
                document.getElementById('closeCloseDefectModalWindow').click();
                appVueFilter.useFilter();
                Swal.fire("ДЕФЕКТ ЗАКРЫТ", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401) {
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ЗАКРЫТИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }); /* axios */
          }
        });
      },/* closeDefect */
      infoDefect() {
        appInfoDefect.defect_id = this.defect_id;
        appInfoDefect.parent_button_close_modal_name = 'closeInfoDefectModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('InfoDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      },/* infoDefect */
      requiresSolution() {
        if (this.currentUser.user_division != this.cardDivisionOwner && !this.currentUserRole.includes('Администратор')
          /* && this.currentUser.user_division != 'РусАС' */) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDivisionOwner  + "'</b>", heightAuto: false}); 
          return;  
        }  
        appCorrectionDefect.defect_id = this.defect_id;
        appCorrectionDefect.parent_button_close_modal_name = 'closeCloseDefectModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CorrectionDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      },/* requiresSolution */
      cancelDefect() {
        Swal.fire({
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
                document.getElementById('closeCloseDefectModalWindow').click();
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
                }) /* axios */
            }
        });
      },/* cancelDefect */
      exportHistoryExcel(){
        runExportHistoryExcel(this.defect_id);
      }, /* exportHistoryExcel */
      },
    }).mount('#vueCloseDefect')