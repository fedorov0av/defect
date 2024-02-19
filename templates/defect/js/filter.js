const appVueFilter = Vue.createApp({
    data() {
      return {
        divisions: {}, 
        type_defects: {},
        statuses_defect: {}, 
        defects: {},

        filterType: 0,
        filterManager: 0,
        filterDivision: 0,
        startDate: null,
        endDate: null,
        filterStatusDefect: 0,
        ppr: 'false',
        pnr: false,
        safety: false,
        exploitation: false,
      }
    },
    mounted() {
      this.updateAllTables()
      this.updateTableStatusDefect()
      this.setDivisionByUser()
    }, /* mounted */
    methods: {
        toggleApiOnSilent() {
          document.getElementById('toggle-silent').switchButton('on', true);
        },
        toggleApiOffSilent() {
          document.getElementById('toggle-silent').switchButton('off', true);
        },
        clearData() {
          this.filterType = 0;
          this.filterManager = 0;
          this.filterDivision = 0;
          this.startDate = null;
          this.endDate = null;
          this.filterStatusDefect = 0;
          this.ppr = 'false';
        }, /* clearData */

        updateTableTypeDefect() {
          axios
          .post('/type_defect',)
          .then(response => {
              this.type_defects = response.data;
                }) /* axios */
        }, /* updateTableTypeDefect */

        updateTableDivision() {
          axios
          .post('/divisions',)
          .then(response => {
              this.divisions = response.data;
                }) /* axios */
        }, /* updateTableDivision */
        
        updateAllTables() {
          this.updateTableDivision();
          this.updateTableTypeDefect();
        }, /* updateAllTables */

        useFilter() {
          if (this.startDate !== null && this.endDate !== null) {
            if (this.startDate >= this.endDate) {
              if (this.startDate != this.endDate){
              Swal.fire({html:"<b>Дата окончания должна быть позже даты начала!</b>", heightAuto: false}); 
              return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
              } else return;
            }
          }
          if (this.pnr === true){ 
            this.safety = false;
            this.exploitation = false;
          }
          axios
            .post('/get_defect_by_filter/', 
              {"date_start": this.startDate,
               "date_end": this.endDate,
               "division_id":  this.filterDivision,
               "status_id":  this.filterStatusDefect,
               "ppr": this.ppr === true ? true : null,
               "pnr": this.pnr === true ? true : null,
               "safety": this.safety === true ? true : null,
               "exploitation": this.exploitation === true ? true : null,
               "type_defect_id":  this.filterType,
              //  "division_id": {
              //     "division_id": this.filterDivision !== 0 ? this.filterDivision : 0
              //   },
              //   "status_id": {
              //     "status_id": this.filterStatusDefect !== 0 ? this.filterStatusDefect : 0
              //   }
              }
            )
            .then(response => {
              appVueDefect.defects = response.data;
              for (defect in appVueDefect.defects){
                let responsible = null
                if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Зарегистрирован' || appVueDefect.defects[defect].defect_status.status_defect_name === 'Устранен' || appVueDefect.defects[defect].defect_status.status_defect_name === 'Закрыт' || appVueDefect.defects[defect].defect_status.status_defect_name === 'Требует решения'){
                  responsible = appVueDefect.defects[defect].defect_owner;
                } else if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Адресован'){
                  responsible = appVueDefect.defects[defect].defect_repair_manager.user_surname + ' ' + appVueDefect.defects[defect].defect_repair_manager.user_name;
                } else if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Назначен исполнитель' || appVueDefect.defects[defect].defect_status.status_defect_name === 'Принят в работу'){
                  responsible = appVueDefect.defects[defect].defect_worker.user_surname + ' ' + appVueDefect.defects[defect].defect_worker.user_name;
                } else if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Работы завершены'){
                  responsible = 'ОП ' + appVueDefect.defects[defect].defect_owner;
                }
                appVueDefect.defects[defect].responsible = responsible;
                let date_background = null
                if ((appVueDefect.defects[defect].defect_planned_finish_date !== "Устр. в ППР") && (appVueDefect.defects[defect].defect_planned_finish_date !== null)){
                  let now = new Date()
                  date_defect_finish_temp = appVueDefect.defects[defect].defect_planned_finish_date.split('-')
                  finish_date = Date.parse(date_defect_finish_temp[2]+'-'+date_defect_finish_temp[1]+'-'+date_defect_finish_temp[0])
                  if (finish_date - now <= 0){
                    date_background = "table-danger"
                  } else if (finish_date - now <= 172800000){
                    date_background = "table-warning"
                  }
                }
                appVueDefect.defects[defect].dateBackgroundColor = date_background;
              }
              
              appVueDefect.pages = 0;
                })
            .catch(err => {
              console.log(err)
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
              }
                }) /* axios */
        }, /* useFilter */
        nouseFilter() {
          this.clearData();
          axios
          .post('/defects',)
          .then(response => {
              appVueDefect.updateTables();
                })
          .catch(err => {
            if (err.response.status === 401){
              window.location.href = "/";
            } else {
              Swal.fire({html:"<b>Произошла ошибка! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
            }
              }) /* axios */
        }, /* nouseFilter */
        updateTableStatusDefect() {
          axios
          .post('/statuses_defect',)
          .then(response => {
              this.statuses_defect = response.data;
                }) /* axios */
        }, /* updateTableStatusDefect */
        setDivisionByUser(){
          axios
          .post('/user/me')
          .then(response => {
              this.currentUser = response.data;
              if (this.currentUser.user_role !== 'Инспектор'){
                this.filterDivision = this.currentUser.user_division_id;
              }
            })
        }, /* setDivisionByUser */
        }, /* methods */
      },
  ).mount('#vueFilter')