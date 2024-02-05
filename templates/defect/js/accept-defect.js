const appAcceptDefect = Vue.createApp({
  data() {
    return {
      defect_id: '0',
      defect_divisions: {},
      defect_type_defects: {},
      statuses_defect:{}, /* ['Зарегистрирован', # 1
               'Подтвержден', # 2
               'Принят в работу', # 3
               'Назначен исполнитель', # 4
               'Работы завершены', # 5
               'Устранен', # 6
               'Не устранен', # 7
               'Требует корректировки', # 8
               'Отменен',  # 9
               ] */
      repair_managers: {},
      workers: {},
      toggle: 'false',
      isDisabledAcceptDefect: false,
      check_worker: false,

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
      cardWorker: {}, /* Для отображения ИСПОЛНИТЕЛЬ РЕМОНТА в карточке  */
      cardPPR: false,
      cardWorkerDescription: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
      cardChecker: '', /* Для отображения ВЫПОЛНИЛ ПРОВЕРКУ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
      cardCheckerDescription: '', /* Для отображения РЕЗУЛЬТАТ ПРОВЕРКИ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */

      newWorker_id: 0, /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */

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
      

    }
  },
  beforeMount() {
    axios
    .post('/user/user_role')
    .then(response => {
        this.currentUser = response.data;
        this.currentUserRole = this.currentUser.user_role;
        if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Руководитель') {
          this.isDisabledAcceptDefect = true;
        }
      })
  },
  mounted() {
    this.setPopover();
    var myModalEl = document.getElementById('AcceptModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        /* console.log(event); */
        appAcceptDefect.clearData();
    })
  }, 
  methods: {
    setPopover(){
      $(document).ready(function(){
        if($("#acceptCancelDefectButton").is(":disabled") && $("#acceptAcceptDefectButton").is(":disabled"))  {
          $('[data-toggle="popover_accept"]').popover({
          placement : 'top'
        });
        }
      });
    }, /* setPopover */
    clearData() {
      this.newWorker_id = 0;
      this.check_worker = false;
    },
    updateTables() {
      this.updateTableDivision();
      this.updateTableTypeDefect();
      this.updateCardDefect();
      this.updateTableStatusDefect();
      this.updateTableHistory();
      this.updateTableRepairManagers();
      this.updateTableWorkers();
    }, /* updateTables */
    updateTableWorkers() {
      axios
      .post('/user/workers',)
      .then(response => {
          this.workers = response.data;
          axios
          .post('/user/me',)
          .then(response => {
            this.currentUser = response.data;
            this.workers = this.workers.concat(this.currentUser)
            }) /* axios */
        }) /* axios */
    }, /* updateTableWorkers */
    updateTableRepairManagers() {
      axios
      .post('/user/repair_managers',)
      .then(response => {
          this.repair_managers = response.data;
            }) 
    }, 
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
          /* this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date != null ? this.cardDefect.defect_planned_finish_date.replace(/-/g, ".") : null; */
          this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date != null ? this.cardDefect.defect_planned_finish_date : null;
          this.cardPPR = this.cardDefect.defect_ppr;
          this.cardWorker = this.cardDefect.defect_worker;
          this.cardChecker = this.cardDefect.defect_checker ? this.cardDefect.defect_checker.user_surname + ' ' + this.cardDefect.defect_checker.user_name : '';
          this.cardCheckerDescription = this.cardDefect.defect_check_result ? this.cardDefect.defect_check_result : '';
          this.newWorker_id = this.cardDefect.defect_worker ? this.cardDefect.defect_worker.user_id : 0;
              })
        .catch(err => {
            Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
            console.log(err);
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
                Swal.fire({html:"<b>Произошла ошибка при выводе ИСТОРИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
    }, /* updateTableHistory */
    acceptDefect() {
      if (this.newWorker_id == 0) {
        this.check_worker = true
        Swal.fire({html:"<b>Не назначен исполнитель ремонта</b>", heightAuto: false}); 
        return;  /* Если ИСПОЛНИТЕЛЬ РЕМОНТА не заполнен, то выходим из функции */
      }
      Swal.fire({
        title: "Вы действительно хотите назначить исполнителя?",
        showDenyButton: true,
        confirmButtonText: "ДА",
        denyButtonText: `ОТМЕНА`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          data = {
          "defect_id": {
            "defect_id": this.defect_id
          },
          "status_name": {
            "status_defect_name": this.statuses_defect[3].status_defect_name
          },
          "worker_id": {
            "user_id": this.newWorker_id
          },
          "comment": {
            "comment": null
          }
          }
          axios
          .post('/accept_defect', data)
          .then(response => {
              document.getElementById('closeAcceptModalWindow').click();
              appVueDefect.updateTables()
              /* console.log(response.data); */
              Swal.fire("НАЗНАЧЕН ИСПОЛНИТЕЛЬ!", "", "success");
                }) /* axios */
          .catch(err => {
                  Swal.fire({html:"<b>Произошла ошибка при НАЗНАЧЕНИИ ИСПОЛНИТЕЛЯ! Обратитесь к администратору!</b>", heightAuto: false}); 
                  console.log(err);
              }) /* axios */
        }
      });
    },/* acceptDefect */
    cancelDefect() {
        appCorrectionDefect.defect_id = defect_id;
        appCorrectionDefect.parent_button_close_modal_name = 'closeAcceptModalWindow';
        var myModal = new bootstrap.Modal(document.getElementById('CorrectionDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      }
    },
  }).mount('#vueAcceptDefect')