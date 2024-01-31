const appCheckDefect = Vue.createApp({
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
        registrators: {},
        workers: {},
        toggle: 'false',
        isDisabledCheckDefect: false,

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
        newCheckerId: 0, /* Для хранения ID РЕГИСТРАТОРА в карточке  */
        cardCheckerDescription: '',

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
    /* mounted() {
      this.updateTables()
    }, */
    beforeMount() {
      axios
      .post('/user/user_role')
      .then(response => {
          this.currentUser = response.data;
          this.currentUserRole = this.currentUser.user_role;
          if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Регистратор') {
            this.isDisabledCheckDefect = true;
          }
        })
    }, 
    mounted() {
      this.setPopover();
      var myModalEl = document.getElementById('CheckModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appCheckDefect.clearData();
      })
    },
    methods: {
      clearData() {
        this.newCheckerId = 0;
        this.cardCheckerDescription = '';

      }, /* clearData */
      setPopover(){
        $(document).ready(function(){
          if($("#checkDangerDefectButton").is(":disabled") && $("#checkSuccessDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_check"]').popover({
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
        this.updateTableRegistrators();
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
      updateTableRegistrators() {
        axios
        .post('/user/registrators',)
        .then(response => {
            this.registrators = response.data;
              }) /* axios */
      }, /* updateTableRegistrators */
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
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardPPR = this.cardDefect.defect_ppr;
            this.cardWorker = this.cardDefect.defect_worker.user_surname + ' ' + this.cardDefect.defect_worker.user_name;
            this.cardWorkerDescription = this.cardDefect.defect_work_comment
            this.newCheckerId = this.cardDefect.defect_checker ? this.cardDefect.defect_checker.user_id : 0;
            
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
      successDefect() {
        if (this.cardCheckerDescription == '') {
          Swal.fire({html:"<b>Не заполнен результат проверки!</b>", heightAuto: false}); 
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
              "defect_check_result": {
                "comment": this.cardCheckerDescription
              }
            } 
            axios
            .post('/check_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                appVueDefect.updateTables()
                console.log(response.data);
                Swal.fire("ДЕФЕКТ УСТРАНЕН", "", "success");
                  }) /* axios */
            .catch(err => {
                    Swal.fire({html:"<b>Произошла ошибка при ПРИНЯТИИ ДЕФЕКТА В РАБОТУ! Обратитесь к администратору!</b>", heightAuto: false}); 
                    console.log(err);
                }) /* axios */
          }
        });
      },/* executionDefect */
      dangerDefect() {
        Swal.fire({
          title: "Вы подтверждаете, что дефект не устранен?",
          showDenyButton: true,
          confirmButtonText: "ДА",
          denyButtonText: `НЕТ`
        }).then((result) => {
          /* Read more about isAccepted, isDenied below */
          if (result.isConfirmed) {
            data = {"defect_id": {"defect_id": this.defect_id},"status_name": {"status_defect_name": this.statuses_defect[6].status_defect_name}}
            axios
            .post('/update_status_defect', data)
            .then(response => {
                document.getElementById('closeCheckModalWindow').click();
                appVueDefect.updateTables()
                console.log(response.data);
                Swal.fire("ДЕФЕКТ ОТПРАВЛЕН НА УСТРАНЕНИЕ ЗАНОВО", "", "success");
                  }) /* axios */
            .catch(err => {
                    Swal.fire({html:"<b>Произошла ошибка при ОТПРАВКЕ ДЕФЕКТА НА КОРРЕКТИРОВКУ! Обратитесь к администратору!</b>", heightAuto: false}); 
                    console.log(err);
                }) /* axios */
            }
        });
      },/* cancelDefect */
      },
    }).mount('#vueCheckDefect')