const appVueAddDefect = Vue.createApp({
    data() {
      return {
        defect_divisions: {},
        defect_type_defects: {},

        newSystemName: '',
        newSystemKKS: '',
        newDefectNotes: '',
        newLocation: '',
        newTypeDefect: '',
        newDivisionOwner: '',
      }
    },
    mounted() {
      this.updateTableDivision()
      this.updateTableTypeDefect()
    },
    methods: {
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
            console.log(this.defect_divisions);
              }) /* axios */
      }, /* updateTableDivision */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
            console.log(this.defect_type_defects);
              }) /* axios */
      }, /* updateTableTypeDefect */
      addNewDefect() {
        if (this.newSystemName == '' || this.newDefectNotes == '' || this.newTypeDefect == '' || this.newLocation == ''){
              Swal.fire({html:"<b>Все значения (кроме KSS) должны быть заполнены!</b>", heightAuto: false}); 
        } /* if */
        else {
          axios
          .post('/defect/add', 
              {
                "defect_description": this.newDefectNotes,
                "defect_system_name": this.newSystemName,
                "defect_system_kks": this.newSystemKKS,
                "defect_type_defect_name": this.newTypeDefect,
                "defect_location": this.newLocation
              }
          )
          .then(response => {
              console.log(response.data);
              Swal.fire({html:"<b>Дефект добавлен!</b>", heightAuto: false}); 
              document.getElementById('closeModalAddUser').click();
              
                })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при добавлении дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
        } /* else */
      }, /* addNewDefect */

      },
      },
    ).mount('#vueAddDefect')


const appConfirmDefect = Vue.createApp({
      data() {
        return {
          defect_id: 0,
          defect_divisions: {},
          defect_type_defects: {},
          statuses_defect:{},

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
          cardWorkerDescription: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
          cardChecker: {}, /* Для отображения ВЫПОЛНИЛ ПРОВЕРКУ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */
          cardCheckerDescription: {}, /* Для отображения РЕЗУЛЬТАТ ПРОВЕРКИ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !! */

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
          }], /* ОБЩИЙ ОБЪЕКТ для храненения данных истории дефекта   */
          

        }
      },
      /* mounted() {
        this.updateTableDefect()
      }, */
      methods: {
        updateTables() {
          this.updateTableDivision();
          this.updateTableTypeDefect();
          this.updateCardDefect();
          this.updateTableStatusDefect();
          this.updateTableHistory();
        }, /* updateTables */
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
              "defect_id": parseInt(this.defect_id),
            })
            .then(response => {
              this.cardDefect = response.data;
              console.log('this.cardDefect', this.cardDefect);

              this.cardDefectID = this.cardDefect.defect_id; 
              this.cardStatusDefectName = this.cardDefect.defect_status.status_defect_name; 
              this.cardTypeDefectName = this.cardDefect.defect_type.type_defect_name; 

              this.cardKKS = this.cardDefect.defect_system.system_kks; 
              this.cardSystemName = this.cardDefect.defect_system.system_name; 
              this.cardDescription = this.cardDefect.defect_description;
              this.cardLocation = this.cardDefect.defect_location;
              this.cardDivisionOwner = this.cardDefect.defect_division.division_name;
              this.cardRegistrator = this.cardDefect.defect_registrar;
              this.cardDateRegistration = this.cardDefect.defect_created_at;
              this.cardRepairManager = this.cardDefect.defect_repair_manager;
              this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
              this.cardWorker = this.cardDefect.defect_worker;

                  })
            .catch(err => {
                Swal.fire({html:"<b>Произошла ошибка при выводе карточки дефекта! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
            }) /* axios */
        }, /* updateCardDefect */
        updateTableHistory() {
            axios
            .post('/history_by_defect',{
              "defect_id": parseInt(this.defect_id),
            })
            .then(response => {
                this.cardHistorys = response.data;
                console.log(this.cardHistorys);

                /* this.cardHistoryUser = this.cardHistory.history_user.user_surname;
                this.cardHistoryDate = this.cardHistory.history_date;
                this.cardHistoryStatus = this.cardHistory.history_status;
                this.cardHistoryComment = this.cardHistory.history_comment; */

                  }) /* axios */
            .catch(err => {
                    Swal.fire({html:"<b>Произошла ошибка при выводе ИСТОРИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                    console.log(err);
                }) /* axios */
        }, /* updateTableHistory */
        confirmDefect() {
          Swal.fire({
            title: "Вы действительно хотите подтвердить дефект?",
            showDenyButton: true,
            confirmButtonText: "ПОДТВЕРЖДАЮ!",
            denyButtonText: `ОТМЕНА!`
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              data = {"defect_id": {"defect_id": parseInt(this.defect_id)},"status_name": {"status_defect_name": this.statuses_defect[1].status_defect_name}}
              axios
              .post('/update_status_defect', data)
              .then(response => {
                  document.getElementById('closeConfirmDefectModalWindow').click();
                  appVueDefect.updateTables()
                  console.log(response.data);
                  Swal.fire("ДЕФЕКТ ПОДТВЕРЖДЕН!", "", "success");
                    }) /* axios */
              .catch(err => {
                      Swal.fire({html:"<b>Произошла ошибка при ПОДТВЕРЖДЕНИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                  }) /* axios */
            } else if (result.isDenied) {
              Swal.fire("ОПЕРАЦИЯ ОТМЕНЕНА", "", "info");
            }
          });

          
          console.log();
        },/* confirmDefect */
        },
      }).mount('#vueConfirmDefect')
  


