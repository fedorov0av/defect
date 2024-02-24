const appFinishWorkDefect = Vue.createApp({
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
        isDisabledFinishDefect: false,
        check_worker_discription: false,
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
    beforeMount() {
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserRole = this.currentUser.user_role;
          if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Исполнитель') {
            this.isDisabledFinishDefect = true;
          }
        })
    },
    mounted() {
      this.setPopover();
      this.isHiddenblockhistory = 'true';
      this.isHiddenblockclassification  = 'true';
      updateCategoriesReason(this.categories_reason);
      updateCategoriesDefect(this.categories_defect);
      this.setLimit();
      var myModalEl = document.getElementById('FinishWorkModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appFinishWorkDefect.clearData();
        appFinishWorkDefect.setLimit();
      })
    },
    methods: {
      changeWorker() {
        this.isDisabledWorker = false
      },
      clearData() {
        this.cardWorkerDescription = '';
        this.check_worker_discription = false;
      }, /* clearData */
      setPopover(){
        $(document).ready(function(){
          if($("#finishCancelDefectButton").is(":disabled") && $("#finishFinishDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_finish"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */ 
      changeTextWork(event){
        if (event.target.value.length > 200){
          event.target.value = event.target.value.slice(0, 200);
        }
      }, /* changeTextWork */
      setLimit(){
        setLimit("my-text", "result", 200)
      }, /* setlimit*/
      updateTables() {
        updateTableDivision(this.defect_divisions);
        updateTableTypeDefect(this.defect_type_defects);
        updateTableStatusDefect(this.statuses_defect);
        updateTableHistory(this.defect_id, this.cardHistorys);
        updateTableRepairManagers(this.repair_managers);
        updateTableWorkers(this.workers);
        this.updateCardDefect();
        this.isDisabledWorker = true;
        this.clickbuttonmain();
      }, /* updateTables */
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
      finishworkDefect() {
        if (this.cardWorkerDescription == '') {
          this.check_worker_discription = true
          Swal.fire({html:"<b>Не заполнен комментарий о выполненных работах!</b>", heightAuto: false}); 
          return;   /* Если ИСПОЛНИТЕЛЬ РЕМОНТА не заполнен, то выходим из функции */
        }
        Swal.fire({
          title: "Вы подверждаете, что работы завершены?",
          showDenyButton: true,
          confirmButtonText: "ПОДТВЕРЖДАЮ",
          denyButtonText: `ОТМЕНА`
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            data = {
              "defect_id": {
                "defect_id": this.defect_id
              },
              "status_name": {
                "status_defect_name": this.statuses_defect[4].status_defect_name
              },
              "worker_description": {
                "comment": this.cardWorkerDescription
              }
            }
            axios
            .post('/finish_work_defect', data)
            .then(response => {
                document.getElementById('closeFinishWorkModalWindow').click();
                appVueDefect.updateTables()
                Swal.fire("РАБОТЫ ПО ДЕФЕКТУ ЗАВЕРШЕНЫ", "", "success");
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
      },/* finishworkDefect */
      cancelDefect() {
        appCorrectionDefect.defect_id = defect_id;
        appCorrectionDefect.parent_button_close_modal_name = 'closeFinishWorkModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CorrectionDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      },/* cancelDefect */
      exportHistoryExcel(){
        runExportHistoryExcel(this.defect_id);
      }, /* exportHistoryExcel */
      },
    }).mount('#vueFinishWorkDefect')