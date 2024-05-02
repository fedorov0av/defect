const appCheckDefect = Vue.createApp({
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
        registrators: {},
        workers: {},
        toggle: 'false',
        isDisabledCheckDefect: false,
        check_checker_name: false,
        check_checker_discription: false,
        isDisabledWorker: false,
        cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */
        cardDefectID: 0, /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
        cardStatusDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardTypeDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
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
        newCheckerId: '', /* Для хранения ID РЕГИСТРАТОРА в карточке  */
        cardCheckerDescription: '',
        newCoreClassificationCode: '',
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
    beforeMount() {
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserRole = this.currentUser.user_role;
          if (!this.currentUserRole.includes('Администратор')) {
            this.isDisabledCheckDefect1 = true;
          }
          if (!this.currentUserRole.includes('Администратор') && !this.currentUserRole.includes('Регистратор')) {
            this.isDisabledCheckDefect = true;
          }
/*           if (this.currentUser.user_division != this.cardDivisionOwner) {
            this.isDisabledCheckDefect2 = true;
          }  */  
        })
    }, 
    mounted() {
      this.setPopover();
      this.isHiddenblockhistory = 'true';
      this.isHiddenblockclassification  = 'true';
      updateCategoriesReason(this.categories_reason);
      updateCategoriesDefect(this.categories_defect);
      var myModalEl = document.getElementById('CheckModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appCheckDefect.clearData();
      })
    },
    methods: {
      changeWorker() {
        this.isDisabledWorker = false
      },
      clearData() {
        this.newCheckerId = '';
        this.cardCheckerDescription = '';
        this.check_checker_name = false;
        this.check_checker_discription = false;
      }, /* clearData */
      changeTextCheck(event){
        if (event.target.value.length > 100){
          event.target.value = event.target.value.slice(0, 100);
        }
      }, /* changeTextCheck */
      /*setPopover(){
        $(document).ready(function(){
          if($("#checkDangerDefectButton").is(":disabled") && $("#checkSuccessDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_check"]').popover({
            placement : 'top'
          });
          }
        });
      },  setPopover */
      setPopover(){
        $(document).ready(function(){
          if($("#checkCheckDefectButton1"))  {
            $('[data-toggle="popover_check"]').popover({
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
        this.updateTableRegistrators();
        this.updateCardDefect();
        this.isDisabledWorker = true;
        this.clickbuttonmain();
      }, /* updateTables */
      updateTableRegistrators() {
        axios
        .post('/user/registrators',)
        .then(response => {
            this.registrators = response.data;
              }) /* axios */
      }, /* updateTableRegistrators */
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
            this.cardWorker = this.cardDefect.defect_worker.user_surname + ' ' + this.cardDefect.defect_worker.user_name;
            this.cardWorkerDescription = this.cardDefect.defect_work_comment;
            this.newCheckerId = this.cardDefect.defect_checker ? this.cardDefect.defect_checker.user_id : '';
            this.isHiddenDate = this.cardDefect.defect_ppr === true ? 'true' : 'false';
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
            this.newDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : ''; 
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
      successDefect() {
        if (this.currentUser.user_division != this.cardDivisionOwner && !this.currentUserRole.includes('Администратор')) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDivisionOwner  + "'</b>", heightAuto: false}); 
          return;  
        }  
        if (this.newCheckerId === '') {
          this.check_checker_name = true;
          Swal.fire({html:"<b>Не выбран проверяющий!</b>", heightAuto: false}); 
          return;  /* Если ПРОВЕРЯЮЩИЙ не заполнен, то выходим из функции */
        }
        Swal.fire({
          title: "Вы подтверждаете, что дефект устранен?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            data =
            {
              "defect_id": {
                "defect_id": this.defect_id
              },
              "status_name": {
                "status_defect_name": this.statuses_defect[5].status_defect_name
              },
              "checker_id": {
                "user_id": this.newCheckerId
              },
              "defect_check_result": {
                "comment": 'Дефект устранен!'
              }
            } 
            axios
            .post('/check_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                /* appVueDefect.updateTables() */
                appVueFilter.useFilter()
                Swal.fire("ДЕФЕКТ УСТРАНЕН!", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ПРИНЯТИИ ДЕФЕКТА В РАБОТУ! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
          }
        });
      },/* executionDefect */
      warningDefect() {
        if (this.currentUser.user_division != this.cardDivisionOwner && !this.currentUserRole.includes('Администратор')) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDivisionOwner  + "'</b>", heightAuto: false}); 
          return;  
        }   
        if (this.newCheckerId === '') {
          this.check_checker_name = true;
          Swal.fire({html:"<b>Не выбран проверяющий!</b>", heightAuto: false}); 
          return;  /* Если ПРОВЕРЯЮЩИЙ не заполнен, то выходим из функции */
        }
        Swal.fire({
          title: "Вы подтверждаете, что дефект локализован?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          if (result.isConfirmed) {
            data =
            {
              "defect_id": {
                "defect_id": this.defect_id
              },
              "status_name": {
                "status_defect_name": this.statuses_defect[10].status_defect_name
              },
              "checker_id": {
                "user_id": this.newCheckerId
              },
              "defect_check_result": {
                "comment": 'Дефект локализован!'
              }
            } 
            axios
            .post('/check_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                /* appVueDefect.updateTables() */
                appVueFilter.useFilter()
                Swal.fire("ДЕФЕКТ ЛОКАЛИЗОВАН!", "", "success");
                  })
            .catch(err => {
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ЛОКАЛИЗАЦИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
          }
        });
      },/* warningDefect */
      dangerDefect() {
        if (this.currentUser.user_division != this.cardDivisionOwner && !this.currentUserRole.includes('Администратор')) {
          Swal.fire({html:"<b>Это дефект не вашего подразделения! Вы из '" + this.currentUser.user_division  + "', а этот дефект относится к '" + this.cardDivisionOwner  + "'</b>", heightAuto: false}); 
          return;  
        }   
        if (this.newCheckerId === '') {
          this.check_checker_name = true;
          Swal.fire({html:"<b>Не выбран проверяющий!</b>", heightAuto: false}); 
          return;  /* Если ПРОВЕРЯЮЩИЙ не заполнен, то выходим из функции */
        }
        if (this.cardCheckerDescription === '') {
          this.check_checker_discription = true;
          Swal.fire({html:"<b>Не заполнен результат проверки!</b>", heightAuto: false}); 
          return;  /* Если комментарий проверяющего не заполнен, то выходим из функции */
        }
        Swal.fire({
          title: "Вы подтверждаете, что дефект не устранен?",
          showDenyButton: true,
          confirmButtonText: "ДА",
          denyButtonText: `НЕТ`
        }).then((result) => {
          /* Read more about isAccepted, isDenied below */
          if (result.isConfirmed) {
            data = 
            {"defect_id": {
                "defect_id": this.defect_id
              },
              "status_name": {
                "status_defect_name": this.statuses_defect[6].status_defect_name
              },
              "checker_id": {
                "user_id": this.newCheckerId
              },
              "defect_check_result": {
                "comment": this.cardCheckerDescription
              }
            }
            axios
            .post('/check_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                /* appVueDefect.updateTables() */
                appVueFilter.useFilter()
                Swal.fire("ДЕФЕКТ ОТПРАВЛЕН НА УСТРАНЕНИЕ ЗАНОВО", "", "success");
                  })
            .catch(err => { 
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при ОТПРАВКЕ ДЕФЕКТА НА УСТРАНЕНИЕ ЗАНОВО! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
            }
        });
      },
      cancelDefect() {
        Swal.fire({
          title: "Вы действительно хотите отменить дефект?",
          showDenyButton: true,
          confirmButtonText: "ДА",
          denyButtonText: `НЕТ`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            data = {"defect_id": {"defect_id": this.defect_id},"status_name": {"status_defect_name": this.statuses_defect[8].status_defect_name}}
            axios
            .post('/update_status_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                /* appVueDefect.updateTables() */
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
    }).mount('#vueCheckDefect')