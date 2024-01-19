
const appConfirmDefect = Vue.createApp({
    data() {
      return {
        defect_id: '0',
        defect_divisions: {},
        defect_type_defects: {},
        statuses_defect:{},
        repair_managers: {},
        workers: {},
        toggle: 'false',
        isDisabledConfirmDefect: false,
        isHiddenDate: 'false',

        modalConfirmDefectModalWindow: Vue.ref('modalConfirmDefectModalWindow'),

        cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */

        cardDefectID: 0, /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
        cardStatusDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardTypeDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardKKS: '', /* Для отображения KKS в карточке  */
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

        newRepairManager_id: 0, /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */
        newDivisionOwner_id: 0, /* Для хранения ID ПОДРАЗДЕЛЕНИЯ-ВЛАДЕЛЕЦ  в карточке  */

        newDate: '', /* Для хранения ДАТЫ РЕМОНТА  в карточке  */

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
          if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Владелец') {
            this.isDisabledConfirmDefect = true;
          }
        })
    },
    mounted() {
      this.setPopover();
      var myModalEl = document.getElementById('ConfirmDefectModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appConfirmDefect.clearData();
    })
    },
    methods: {
      setPopover(){
        $(document).ready(function(){
          if($("#confirmCancelDefectButton").is(":disabled") && $("#confirmConfirmDefectButton").is(":disabled"))  {
            $('[data-toggle="popover_confirm"]').popover({
            placement : 'top'
          });
          }
        });
      }, /* setPopover */
      clearData() {
        this.newDivisionOwner_id = 0;
        this.newDate ='';
        this.newRepairManager_id = 0;
        this.isHiddenDate = 'false';

      }, /* clearData */
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
            console.log(this.workers);
              }) /* axios */
      }, /* updateTableWorkers */
      updateTableRepairManagers() {
        axios
        .post('/user/repair_managers',)
        .then(response => {
            this.repair_managers = response.data;
            console.log(this.repair_managers);
              }) /* axios */
      }, /* updateTableRepairManagers */
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
            console.log(this.defect_divisions);
              }) /* axios */
      }, /* updateTableDivision */
      updateTableStatusDefect() {
        axios
        .post('/statuses_defect',)
        .then(response => {
            this.statuses_defect = response.data;
            console.log(this.statuses_defect);
              }) /* axios */
      }, /* updateTableStatusDefect */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
            console.log(this.defect_type_defects);
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
            this.cardRegistrator = this.cardDefect.defect_registrar;
            this.cardDateRegistration = this.cardDefect.defect_created_at;
            this.cardRepairManager = this.cardDefect.defect_repair_manager;
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardWorker = this.cardDefect.defect_worker;
            this.newDivisionOwner_id = this.cardDefect.defect_division ? this.cardDefect.defect_division.division_id : 0;
            this.newRepairManager_id = this.cardDefect.defect_repair_manager ? this.cardDefect.defect_repair_manager.user_id : 0;
            this.newDate = this.cardDefect.defect_planned_finish_date ? this.cardDefect.defect_planned_finish_date  : null;
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
      confirmDefect() {
        //this.newDate = this.cardDatePlannedFinish ? this.cardDatePlannedFinish  : null;
        if ((this.cardDatePlannedFinish == null && this.isHiddenDate == 'false') || this.newRepairManager_id == 0 || this.newDivisionOwner_id == 0 || this.cardDatePlannedFinish == '') {
          Swal.fire({html:"<b>Заполните все необходимые поля. Укажите руководителя ремонта и срок устранения.</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }
        tempDate = this.cardDateRegistration.split(' ')[0].split('-')
        cardDateRegistration = tempDate[2] + '-'+tempDate[1]+'-'+tempDate[0]
        if (this.cardDatePlannedFinish <= cardDateRegistration ) {
          Swal.fire({html:"<b>Срок устранения должен быть позже даты регистрации дефекта</b>", heightAuto: false}); 
          return;  /* Если планируемая дата меньше даты то выходим из функции */
        }
        Swal.fire({
          title: "Вы действительно хотите подтвердить дефект?",
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
                "status_defect_name": this.statuses_defect[1].status_defect_name
              },
              "repair_manager_id": {
                "user_id": parseInt(this.newRepairManager_id)
              },
              "defect_planned_finish_date_str": {
                "date": this.isHiddenDate == 'false' ? this.cardDatePlannedFinish : null
              },
              "defect_ppr": {
                "ppr": this.isHiddenDate == 'true' ? true : false
              },
              "division_id": {
                "division_id": parseInt(this.newDivisionOwner_id)
              }
            }
            console.log(data)
            axios
            .post('/confirm_defect', data)
            .then(response => {
                document.getElementById('closeConfirmDefectModalWindow').click();
                appVueDefect.updateTables()
                console.log(response.data);
                Swal.fire("Дефект подтвержден", "", "success");
                  }) /* axios */
            .catch(err => {
                    Swal.fire({html:"<b>Произошла ошибка при ПОДТВЕРЖДЕНИИ ДЕФЕКТА. Обратитесь к администратору.</b>", heightAuto: false}); 
                    console.log(err);
                }) /* axios */
          }
        });
      },/* confirmDefect */
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
                document.getElementById('closeConfirmDefectModalWindow').click();
                appVueDefect.updateTables()
                console.log(response.data);
                Swal.fire("ДЕФЕКТ ОТМЕНЕН", "", "success");
                  }) /* axios */
            .catch(err => {
                    Swal.fire({html:"<b>Произошла ошибка при ОТМЕНЫ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                    console.log(err);
                }) /* axios */
            }
        });
      },/* cancelDefect */
      },
    }).mount('#vueConfirmDefect')