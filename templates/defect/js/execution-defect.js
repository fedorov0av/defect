const appExecutionDefect = Vue.createApp({
    data() {
      return {
        defect_id: '0',
        defect_divisions: {},
        defect_type_defects: {},
        categories_reason: {},
        categories_defect: {},
        statuses_defect:{}, /* ['Зарегистрирован', # 0
                                'Адресован', # 1
                                'Назначен исполнитель', # 2
                                'Принят в работу', # 3
                                'Работы завершены', # 4
                                'Устранен', # 5
                                'Не устранен', # 6
                                'Требует решения', # 7
                                'Отменен',  # 8
                                'Закрыт',  # 9
                                ] */
        repair_managers: {},
        workers: {},
        toggle: 'false',
        isDisabledExecutionDefect: false,
        isDisabledWorker: true,
        
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
        newWorker_id: 0, /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */
        newCoreClassificationCode: '0',
        newCoreClassificationName: '',
        newCategoryDefect_id: 0,
        newClassSystemName: '',
        newDirectClassificationCode: '',   
        newDirectClassificationName: '', 

        cardHistorys: [{
          "history_id": 0,
          "history_date": "",
          "history_status": "",
          "history_user": {
            "user_id": 0,
            "user_surname": "",
            "user_division_id": 0,
            "user_salt_for_password": "",
            "user_email": "",
            "user_fathername": "",
            "user_name": "",
            "user_position": "",
            "user_password_hash": "",
            "user_temp_password": false,
            "user_created_at": ""
          },
          "history_comment": ""
        }], /* ОБЩИЙ ОБЪЕКТ для храненения данных истории дефекта !!! ЕСЛИ ПОМЕНЯЕТСЯ API ТО ЗАМЕНИТЬ НА АКТУАЛЬНЫЕ ЗНАЧЕНИЯ */

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
    /* mounted() {
      this.updateTables()
    }, */
    beforeMount() {
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserRole = this.currentUser.user_role;
          if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Исполнитель') {
            this.isDisabledExecutionDefect = true;
          }
        })
    },  
    mounted() {
      this.setPopover();
      this.isHiddenblockhistory = 'true';
      this.isHiddenblockclassification  = 'true';
      this.updateCategoriesReason();
      this.updateCategoriesDefect();
    },
    methods: {
      changeWorker() {
        this.isDisabledWorker = false
      },
      setPopover(){
        $(document).ready(function(){
          if($("#executionCancelDefectButton").is(":disabled") && $("#executionExecutionDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_execution"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */
      updateTables() {
        this.updateTableDivision();
        this.updateTableTypeDefect();
        this.updateCardDefect();
        this.updateTableStatusDefect();
        this.updateTableHistory();
        this.updateTableRepairManagers();
        this.updateTableWorkers();
        this.isDisabledWorker = true;
        this.clickbuttonmain();
      }, /* updateTables */
      updateTableWorkers() {
        axios
        .post('/user/workers',)
        .then(response => {
            this.workers = response.data;
              }) /* axios */
      }, /* updateTableWorkers */
      updateTableRepairManagers() {
        axios
        .post('/user/repair_managers',)
        .then(response => {
            this.repair_managers = response.data;
              }) /* axios */
      }, /* updateTableRepairManagers */
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
              }) /* axios */
      }, /* updateTableDivision */
      updateTableStatusDefect() {
        axios
        .post('/statuses_defect',)
        .then(response => {
            this.statuses_defect = response.data;
              }) /* axios */
      }, /* updateTableStatusDefect */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
              }) /* axios */
      }, /* updateTableTypeDefect */
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
            this.cardPPR = this.cardDefect.defect_ppr;
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardWorker = this.cardDefect.defect_worker.user_surname + ' ' + this.cardDefect.defect_worker.user_name;
            this.newWorker_id = this.cardDefect.defect_worker ? this.cardDefect.defect_worker.user_id : 0;

            this.isHiddenDate = this.cardDefect.defect_ppr === true ? 'true' : 'false' 
            this.cardSafety = this.cardDefect.defect_safety;
            this.cardPnr = this.cardDefect.defect_pnr;
            this.cardExploitation = this.cardDefect.defect_exploitation;

            this.newCategoryDefect_id = this.cardDefect.defect_category_defect ? this.cardDefect.defect_category_defect.category_defect_id : 0;
            this.newClassSystemName = this.cardDefect.defect_system_klass ? this.cardDefect.defect_system_klass : '';
            this.newCoreClassificationCode = this.cardDefect.defect_core_category_reason ? this.cardDefect.defect_core_category_reason.category_reason_code : '0';
            category_reason = this.categories_reason.filter((category_reason) => category_reason.category_reason_code === this.newCoreClassificationCode)
            this.newCoreClassificationName = category_reason[0].category_reason_name
            this.newDirectClassificationCode = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_code : '';
            this.newDirectClassificationName = this.cardDefect.defect_direct_category_reason ? this.cardDefect.defect_direct_category_reason.category_reason_name : '';  

            if (this.currentUser.user_role === 'Исполнитель' && this.currentUser.user_id !== this.cardDefect.defect_worker.user_id){
              this.isDisabledExecutionDefect = true;
            }
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
      updateTableHistory() {
          axios
          .post('/history_by_defect',{
            "defect_id": this.defect_id,
          })
          .then(response => {
              this.cardHistorys = response.data;
                }) /* axios */
          .catch(err => {
                  if (err.response.status === 401){
                    window.location.href = "/";
                  } else {
                    Swal.fire({html:"<b>Произошла ошибка при выводе ИСТОРИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                    console.log(err);
                  }
              }) /* axios */
      }, /* updateTableHistory */
      saveChange() {
        Swal.fire({
          title: "Вы действительно хотите назначить другого исполнителя?",
          showDenyButton: true,
          confirmButtonText: "ДА",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            new_worker = this.workers.filter(worker => Object.values(worker).some(value => value === this.newWorker_id))[0]
            data = {
            "defect_id": {
              "defect_id": this.defect_id
            },
            "status_name": {
              "status_defect_name": this.statuses_defect[2].status_defect_name
            },
            "worker_id": {
              "user_id": this.newWorker_id
            },
            "comment": {
              "comment": "Поменялся исполнитель с '"+this.cardWorker+"' на '"+new_worker.user_surname + " " + new_worker.user_name+"'"
            }
            }
            axios
            .post('/accept_defect', data)
            .then(response => {
                appVueDefect.updateTables()
                /* console.log(response.data); */
                Swal.fire("НАЗНАЧЕН НОВЫЙ ИСПОЛНИТЕЛЬ!", "", "success");
                this.isDisabledWorker = true;
                this.updateTableHistory();
                  }) /* axios */
            .catch(err => {
                    if (err.response.status === 401){
                      window.location.href = "/";
                    } else {
                      Swal.fire({html:"<b>Произошла ошибка при НАЗНАЧЕНИИ ИСПОЛНИТЕЛЯ! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                    }
                }) /* axios */
          }
        });
      },/* saveChange */
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
      executionDefect() {
        if (this.cardWorker == '') {
          Swal.fire({html:"<b>ИСПОЛНИТЕЛЬ РЕМОНТА!</b>", heightAuto: false}); 
          return;  /* Если ИСПОЛНИТЕЛЬ РЕМОНТА не заполнен, то выходим из функции */
        }
        Swal.fire({
          title: "Вы действительно хотите принять дефект в ремонт?",
          showDenyButton: true,
          confirmButtonText: "ПРИНИМАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            data = {"defect_id": {"defect_id": this.defect_id}, "status_name": {"status_defect_name": this.statuses_defect[3].status_defect_name}}
            axios
            .post('/update_status_defect', data)
            .then(response => {
                document.getElementById('closeExecutionModalWindow').click();
                appVueDefect.updateTables()
                Swal.fire("ДЕФЕКТ ПРИНЯТ В РАБОТУ", "", "success");
                  }) /* axios */
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
      cancelDefect() {
        appCorrectionDefect.defect_id = defect_id;
        appCorrectionDefect.parent_button_close_modal_name = 'closeExecutionModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CorrectionDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      },/* cancelDefect */
      exportHistoryExcel(){
        Swal.fire({
          title: "Выгрузить карточку дефекта в файл Excel?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          if (result.isConfirmed) {
            axios({
              url: '/export_history_excel_defect',
              data: {
                "defect_id": this.defect_id
              },
              method: 'POST',
              responseType: 'blob', // Важно указать responseType как 'blob' для скачивания файла
            })
            .then(response => {
              // Создаем ссылку для скачивания файла
              let today = new Date();
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', ('history_defects_'+today.getDate()+'_'+(parseInt(today.getMonth())+1)+'_'+today.getFullYear()+'.xlsx')); // Установите желаемое имя файла
              document.body.appendChild(link);
              link.click();
              Swal.fire("Карточка дефекта выгружена в каталог 'Загрузки' на ваш компьютер!", "", "success");
            })
              .catch(error => {
                if (err.response.status === 401){
                  window.location.href = "/";
                } else {
                console.error(error);
                }
              });
            }
        });
      }, /* exportHistoryExcel */
      },
    }).mount('#vueExecutionDefect')