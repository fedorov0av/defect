const appConfirmDefect = Vue.createApp({
    directives: {'maska': Maska.vMaska},
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
        check_repair_manager: false,
        isHiddenblockmain: 'false',
        isHiddenblockhistory: 'false',
         
        placeholders: {
          'ЖД основного оборудования': '##XXX##XX###',
          'ЖД по строительным конструкциям': '##XXX##XN##AAAAAA',
          'ЖД по освещению': '##XXX##XX###',
          'ЖД по системам пожаротушения': '##XXX##',
          },

        modalConfirmDefectModalWindow: Vue.ref('modalConfirmDefectModalWindow'),

        cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */

        cardDefectID: 0, /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
        cardStatusDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
        cardTypeDefectName: '', /* Для отображения СТАТУСА ДЕФЕКТА карточке  */
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

        newRepairManager_id: 0, /* Для хранения ID РУКОВОДИТЕЛЯ РЕМОНТА в карточке  */
        newDivisionOwner_id: 0, /* Для хранения ID ПОДРАЗДЕЛЕНИЯ-ВЛАДЕЛЕЦ  в карточке  */

        newSafety: false,
        newPnr: false,
        newExploitation: false,
        
        backgroundMainButtonCCS: "btn-primary",
        backgroundHistoryButtonCCS: "btn-outline-primary",
        backgroundСlassificationButtonCCS: "btn-outline-primary",

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

        maskObject: {},
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
      this.setLimitNotes();
      this.setLimitSystem();
      this.setLimitLocation();
      this.setPopover();
      this.isHiddenblockhistory = 'true';
      var myModalEl = document.getElementById('ConfirmDefectModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appConfirmDefect.clearData();
        appConfirmDefect.setLimitNotes();
        appConfirmDefect.setLimitSystem();
        appConfirmDefect.setLimitLocation();
      })
    },
    methods: {
      setLimitNotes(event){
        var myText1 = document.getElementById("my-notes-confirm");
        var result1 = document.getElementById("notes-confirm");
        var limit1 = 200;
        result1.textContent = 0 + "/" + limit1;
  
        myText1.addEventListener('input',function(){
        var textLength1 = myText1.value.length;
        result1.textContent = textLength1 + "/" + limit1;
        });
      }, /* setLimitNotes */

      setLimitSystem(event){
        var myText = document.getElementById("my-system-confirm");
        var result = document.getElementById("system-confirm");
        var limit = 100;
        result.textContent = 0 + "/" + limit;
  
        myText.addEventListener('input',function(){
        var textLength = myText.value.length;
        result.textContent = textLength + "/" + limit;
        });
      }, /* setLimitSystem */

      setLimitLocation(event){
        var myText = document.getElementById("work-location-confirm");
        var result = document.getElementById("location-confirm");
        var limit = 100;
        result.textContent = 0 + "/" + limit;
  
        myText.addEventListener('input',function(){
        var textLength = myText.value.length;
        result.textContent = textLength + "/" + limit;
        });
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
        if (event.target.value){
          this.style_input_type = "lime"
        }
      }, /* changeTextWork */
      changeTextWork100(event){
        if (event.target.value.length > 100){
          event.target.value = event.target.value.slice(0, 100);
        }
      }, /* changeTextWork100 */
      changeTextWork200(event){
        if (event.target.value.length > 200){
          event.target.value = event.target.value.slice(0, 200);
        }
      }, /* changeTextWork200 */
      changePnr(event){
        if (this.newPnr === true){ 
          this.newSafety = false;
          this.newExploitation = false;
        } else {
          this.newSafety = this.cardDefect.defect_safety;
          this.newExploitation = this.cardDefect.defect_exploitation;
        }
      },
      clearData() {
        this.newCardKKS = null;
        this.newDivisionOwner_id = 0;
        this.newRepairManager_id = 0;
        this.isHiddenDate = 'false';
        this.check_repair_manager = false;

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
            this.cardRegistrator = this.cardDefect.defect_registrar.user_surname + ' ' + this.cardDefect.defect_registrar.user_name;
            this.cardDateRegistration = this.cardDefect.defect_created_at;
            this.cardRepairManager = this.cardDefect.defect_repair_manager;
            this.cardDatePlannedFinish = this.cardDefect.defect_planned_finish_date;
            this.cardWorker = this.cardDefect.defect_worker;
            this.repairManager_id = this.cardDefect.defect_repair_manager ? this.cardDefect.defect_repair_manager.user_id : 0;
            this.divisionOwner_id = this.cardDefect.defect_division ? this.cardDefect.defect_division.division_id : 0;

            this.isHiddenDate = this.cardDefect.defect_ppr === true ? 'true' : 'false' 
            this.newCardLocation = this.cardLocation;
            this.newCardSystemName = this.cardSystemName; 
            this.newCardDescription = this.cardDescription;
            this.newRepairManager_id = this.repairManager_id; //
            this.newCardDatePlannedFinish = this.cardDatePlannedFinish; //
            this.newCardTypeDefectName = this.cardTypeDefectName; //
            this.newCardKKS = this.cardKKS;
            this.newDivisionOwner_id = this.divisionOwner_id;

            this.newSafety = this.cardDefect.defect_safety;
            this.newPnr = this.cardDefect.defect_pnr;
            this.newExploitation = this.cardDefect.defect_exploitation;
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
      checkMask(){
        this.maskObject.completed = this.newCardKKS.length >= this.placeholders[this.newCardTypeDefectName].slice(0,11).length
      },
      clickbuttonmain () {
        this.isHiddenblockmain = 'false';
        this.isHiddenblockhistory = 'true';
        this.backgroundMainButtonCCS = "btn-primary";
        this.backgroundHistoryButtonCCS = "btn-outline-primary";
        this.backgroundСlassificationButtonCCS = "btn-outline-primary";

      },
      clickbuttonhistory () {
        this.isHiddenblockmain = 'true';
        this.isHiddenblockhistory = 'false';
        this.backgroundMainButtonCCS = "btn-outline-primary";
        this.backgroundHistoryButtonCCS = "btn-primary";
        this.backgroundСlassificationButtonCCS = "btn-outline-primary";
      },
      confirmDefect() {
        //this.newDate = this.cardDatePlannedFinish ? this.cardDatePlannedFinish  : null;
        if ((this.newCardDatePlannedFinish == null && this.isHiddenDate == 'false') || this.newDivisionOwner_id == 0 || this.newCardDatePlannedFinish == '') {
          Swal.fire({html:"<b>Заполните все необходимые поля. Укажите срок устранения и руководителя ремонта.</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }
        if (this.newRepairManager_id == 0) {
          this.check_repair_manager = true;
          Swal.fire({html:"<b>Поле Руководитель должно быть заполнено!</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }
        if (this.newCardSystemName == '' || this.newCardDescription == '') {
          Swal.fire({html:"<b>Заполните все необходимые поля. Укажите руководителя ремонта и срок устранения.</b>", heightAuto: false}); 
          return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
        }

        if ((this.cardKKS !== '' && this.newCardKKS !== '' && this.newCardKKS !== null) && this.placeholders[this.newCardTypeDefectName] === '##XXX##XN##AAAAAA') {
          this.checkMask()
        }
        if ((this.cardKKS !== '' && this.newCardKKS !== '' && this.newCardKKS !== null) && !this.maskObject.completed) {
          Swal.fire({html:"<b>KKS введен не полностью!</b>", heightAuto: false});
          return;
        }

        tempDate = this.cardDateRegistration.split(' ')[0].split('-')
        cardDateRegistration = tempDate[2] + '-'+tempDate[1]+'-'+tempDate[0]
        
        if (this.newCardDatePlannedFinish <= cardDateRegistration ) {
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
          repairManager = this.repairManager_id != 0 ? this.repair_managers[this.repair_managers.findIndex(p => p.user_id == this.repairManager_id)].user_surname+' '+this.repair_managers[this.repair_managers.findIndex(p => p.user_id == this.repairManager_id)].user_name : ''
          newRepairManager = this.newRepairManager_id != 0 ? this.repair_managers[this.repair_managers.findIndex(p => p.user_id == this.newRepairManager_id)].user_surname+' '+this.repair_managers[this.repair_managers.findIndex(p => p.user_id == this.newRepairManager_id)].user_name : ''

          if (result.isConfirmed) {
            textHistory = ''
            if (this.newCardTypeDefectName !== this.cardTypeDefectName){
              textHistory = textHistory+'Тип дефекта изменился с "'+this.cardTypeDefectName+'" на "'+this.newCardTypeDefectName+'"\n';
            }
            if (this.newCardKKS !== this.cardKKS){
              textHistory = textHistory+'KKS изменился с "'+(this.cardKKS ? this.cardKKS : "")+'" на "'+(this.newCardKKS ? this.newCardKKS : "")+'"\n';
            }
            if (this.newCardLocation !== this.cardLocation){
              textHistory = textHistory+'Местоположение изменилось с "'+(this.cardLocation ? this.cardLocation : "")+'" на "'+(this.newCardLocation ? this.newCardLocation : "")+'"\n';
            }
            if (this.newCardDescription !== this.cardDescription){
              textHistory = textHistory+'Описание дефекта изменилось с "'+this.cardDescription+'" на "'+this.newCardDescription+'"\n';
            }
            if (this.newDivisionOwner_id !== this.divisionOwner_id){
              textHistory = textHistory+'Подразделение-владелец изменилось с "'+this.defect_divisions[this.divisionOwner_id-1]+'" на "'+this.defect_divisions[this.newDivisionOwner_id-1]+'"\n';
            }
            if (this.newCardSystemName !== this.cardSystemName){
              textHistory = textHistory+'Оборудование изменилось с "'+this.cardSystemName+'" на "'+this.newCardSystemName+'"\n';
            }
            if (this.newRepairManager_id !== this.repairManager_id && this.cardStatusDefectName !== 'Зарегистрирован'){
              textHistory = textHistory+'Руководитель ремонта изменился с "'+repairManager+'" на "'+newRepairManager+'"\n';
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

            if (this.cardDatePlannedFinish !== this.newCardDatePlannedFinish){
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
                "user_id": parseInt(this.newRepairManager_id)
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
              "comment": {
                "comment": textHistory !== '' ? textHistory : null
              }
            }
            axios
            .post('/confirm_defect', data)
            .then(response => {
                document.getElementById('closeConfirmDefectModalWindow').click();
                appVueDefect.updateTables()
                /* console.log(response.data); */
                Swal.fire("Дефект подтвержден", "", "success");
                  })
            .catch(err => {
                    console.log(err);

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
                /* console.log(response.data); */
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
      },
    }).mount('#vueConfirmDefect')