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
        srokDate: null,
        filterStatusDefect: 0,
        ppr: 'false',
        allDefects: false,
        overdue: false,
        pnr: false,
        safety: false,
        exploitation: false,
        dataSearch: '',
        dataSearchDefectID: '',
        oldDefects: {},
        srokDate: '',
      }
    },
    mounted() {
      this.setPopoverDevelop()
      this.setPopoverSafety()
      this.setPopoverExploitation()
      this.updateAllTables()
      /* this.showAlldefects() */
      /* this.showOverduedefects() */
      updateTableStatusDefect(this.statuses_defect)
      /* this.setDivisionByUser() */
    }, /* mounted */
    methods: {
        setPopoverDevelop(){
          $(document).ready(function(){
            if($("#labelAllDefects"))  {
              $('[data-toggle="popover_allDefects"]').popover({
              placement : 'top'
            });
            }
          });
        }, /* setPopover */
        setPopoverSafety(){
          $(document).ready(function(){
            $("#flexSafetyFilter").focus(function () {
            if(appVueFilter.safety == false)  { 
              $('[data-toggle="popover_safety"]').popover("show")
            } else {
              $('[data-toggle="popover_safety"]').popover('dispose')
            } 
          }); 
        })
        },  /* setPopoverSafety */
        setPopoverExploitation(){
          $(document).ready(function(){
            $("#flexExploitationFilter").focus(function () {
            if(appVueFilter.exploitation == false)  { 
              $('[data-toggle="popover_exploitation"]').popover("show")
            } else {
              $('[data-toggle="popover_exploitation"]').popover('dispose')
            } 
          });  
        })
        }, /* setPopoverExploitation */
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
          this.srokDate = null;
          this.filterStatusDefect = 0;
          this.ppr = 'false';
          this.allDefects = false,
          this.overdue = false,
          this.dataSearch = '';
          this.dataSearchDefectID = '';
          this.oldDefects = {};
        }, /* clearData */        
        updateAllTables() {
          updateTableDivision(this.divisions)
          updateTableTypeDefect(this.type_defects)
        }, /* updateAllTables */

        searchResponsibleMainTable(event) {
          if (appVueDefect.pages){
            this.allDefects = true;
            this.useFilter();
            this.allDefects = false;
          }
          document.dispatchEvent(new Event('resetSorting'));
          let tempArray = {}
          let count = 0
          if (this.dataSearch === '' && this.dataSearchDefectID === ''){
            this.useFilter();
            this.oldDefects = {};
            return
          }
          if (Object.keys(this.oldDefects).length === 0){
            this.oldDefects = appVueDefect.defects;
          }

          searchDefects = this.oldDefects
          twix = true ? (this.dataSearch && this.dataSearchDefectID) : false

          for (defect in searchDefects){
            if ((searchDefects[defect].responsible && this.dataSearch !== '') || (this.dataSearchDefectID !== '')){

              defectID = searchDefects[defect].defect_id.includes(this.dataSearchDefectID) ? this.dataSearchDefectID !== '' : false 
              if (searchDefects[defect].responsible){
                repairManager = searchDefects[defect].responsible.toUpperCase().includes(this.dataSearch.toUpperCase()) ? this.dataSearch : false 
              } else {
                repairManager = false
              }
              if (twix){
                if (defectID && repairManager){
                  tempArray[count] = searchDefects[defect];
                  count ++;
                } 
              } else {
                if (defectID || repairManager){
                  tempArray[count] = searchDefects[defect];
                  count ++;
                }
              }
            } 
          }
          
          appVueDefect.defects = tempArray

        }, /* searchResponsibleMainTable */
        /* searchResponsibleMainTable(event) {
          document.dispatchEvent(new Event('resetSorting'));
          let tempArray = {}
          let count = 0
          if (this.dataSearch === ''){
            this.useFilter();
            this.oldDefects = {};
            return
          }
          if (event === null){
            this.oldDefects = {};
          }
          if (Object.keys(this.oldDefects).length === 0){
            this.oldDefects = appVueDefect.defects;
          }
          for (defect in this.oldDefects){
            if (this.oldDefects[defect].responsible !== null && this.oldDefects[defect].responsible !== '' && this.dataSearch !== ''){
              if (this.oldDefects[defect].responsible.toUpperCase().includes(this.dataSearch.toUpperCase())){
                tempArray[count] = this.oldDefects[defect];
                count ++;
              } 
            }
          }
          appVueDefect.defects = tempArray

        }, */ /* searchResponsibleMainTable */
        /* searchResponsibleMainTableDefectID(event) {
          document.dispatchEvent(new Event('resetSorting')); 
          let tempArray = {}
          let count = 0
          if (this.dataSearchDefectID === ''){
            this.useFilter();
            this.oldDefects = {};
            return
          }
          if (event === null){
            this.oldDefects = {};
          }
          if (Object.keys(this.oldDefects).length === 0){
            this.oldDefects = appVueDefect.defects;
          }
          for (defect in this.oldDefects){

            if (this.dataSearchDefectID !== ''){
              if (this.oldDefects[defect].defect_id.includes(this.dataSearchDefectID)){
                tempArray[count] = this.oldDefects[defect];
                count ++;
              }
            }
          }
          appVueDefect.defects = tempArray

        }, */ /* searchResponsibleMainTableDefectID */

        useFilter() {
          if (this.startDate !== null && this.endDate !== null) {
            if (this.startDate >= this.endDate) {
              if (this.startDate != this.endDate){
                Swal.fire({html:"<b>Дата окончания должна быть позже даты начала!</b>", heightAuto: false}); 
                return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
              }
            }
          }
          if (this.pnr === true){ 
            this.safety = false;
            this.exploitation = false; 
          }
          if (this.dataSearch || this.dataSearchDefectID){
            this.dataSearch = '';
            this.dataSearchDefectID = '';
          }
          axios
            .post('/get_defect_by_filter/', 
              {"date_start": this.startDate,
               "date_end": this.endDate,
               "srok_date": this.srokDate,
               "division_id":  this.filterDivision,
               "status_id":  this.filterStatusDefect,
               "ppr": this.ppr === true ? true : null,
               "pnr": this.pnr === true ? true : null,
               "overdue": this.overdue === true ? true : null,
               "allDefects": this.allDefects === true ? true : null,
               "safety": this.safety === true ? true : null,
               "exploitation": this.exploitation === true ? true : null,
               "type_defect_id":  this.filterType,
              }
            )
            .then(response => {
              appVueDefect.defects = response.data;
              for (defect in appVueDefect.defects){
                let responsible = null
                if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Зарегистрирован' ||
                    appVueDefect.defects[defect].defect_status.status_defect_name === 'Устранен' ||
                    appVueDefect.defects[defect].defect_status.status_defect_name === 'Закрыт' ||
                    appVueDefect.defects[defect].defect_status.status_defect_name === 'Требует решения'||
                    /* appVueDefect.defects[defect].defect_status.status_defect_name === 'Не устранен'|| */
                    appVueDefect.defects[defect].defect_status.status_defect_name === 'Локализован'){
                    responsible = appVueDefect.defects[defect].defect_owner;
                } else if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Адресован' ||
                appVueDefect.defects[defect].defect_status.status_defect_name === 'Не устранен'){
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

                  date_srok_filter = Date.parse(appVueFilter.srokDate)
                  
                 /*  console.log(appVueDefect.defects[defect].defect_planned_finish_date)
                  console.log(this.srokDate) 
                  console.log(date_srok_filter == finish_date) */
                  

                  /* console.log(finish_date - now) 
                  if (finish_date - now <= 0 && - так было*/
                  if (finish_date - now < -86400000 && 
                    appVueDefect.defects[defect].defect_status.status_defect_name != 'Отменен' && 
                    appVueDefect.defects[defect].defect_status.status_defect_name != 'Закрыт'){
                    date_background = "table-danger"
                  } else if (finish_date - now <= 172800000 && 
                    appVueDefect.defects[defect].defect_status.status_defect_name != 'Отменен' && 
                    appVueDefect.defects[defect].defect_status.status_defect_name != 'Закрыт'){
                    date_background = "table-warning"
                  }
                }
                appVueDefect.defects[defect].dateBackgroundColor = date_background;

                if (this.srokDate !== ''){ 
                  /* console.log('dawdad') 
                  console.log(date_srok_filter == finish_date)  */
                  finish_date == date_srok_filter;
                } 

              }
              appVueDefect.pages = 0;

              if (this.dataSearch !== ''){
                this.searchResponsibleMainTable(null)
                return
              }
              /* setSortTableDafects(appVueDefect.defects)  */

                })
            .catch(err => {
              if (err.response.status === 401){
                window.location.href = "/";
              } else {
                Swal.fire({html:"<b>Произошла ошибка! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
              }
                }) /* axios */
            document.dispatchEvent(new Event('resetSorting'));
            this.setPopoverSafety();
            this.setPopoverExploitation();
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

        /* setDivisionByUser(){
          axios
          .post('/user/me')
          .then(response => {
              this.currentUser = response.data;
              if (!this.currentUser.user_role.includes('Инспектор')){
                this.filterDivision = this.currentUser.user_division_id;
              }
            })
        }, /* setDivisionByUser */
        }, /* methods */
      },
  ).mount('#vueFilter')