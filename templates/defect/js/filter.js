const appVueFilter = Vue.createApp({ 
  data() {
    return {
      defect_conditions_equipment: {},
      divisions: {}, 
      systems: {}, 
      type_defects: {},
      statuses_defect: {}, 
      defects: {},
      filterType: 0,
      filterCondition: 0,
      filterManager: 0,
      filterDivision: 0,
      filterRepairDivision: 0,
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
      dataSearchSystemKKS: '',
      oldDefects: {},
      srokDate: '',
    }
  },
  mounted() {
    this.setPopoverDevelop()
    this.setPopoverSafety()
    this.setPopoverExploitation()
    this.updateAllTables()
    updateTableStatusDefect(this.statuses_defect)
    this.updateTableConditionEquipment();
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
        this.filterCondition = 0;
        this.filterManager = 0;
        this.filterDivision = 0;
        this.filterRepairDivision = 0;
        this.startDate = null;
        this.endDate = null;
        this.srokDate = null;
        this.filterStatusDefect = 0;
        this.ppr = 'false';
        this.pnr = 'false';
        this.safety = 'false';
        this.exploitation = 'false';
        this.allDefects = false,
        this.overdue = false,
        this.dataSearch = '';
        this.dataSearchDefectID = '';
        this.dataSearchSystemKKS = '';
        this.oldDefects = {};
      }, /* clearData */        
      updateAllTables() {
        updateTableDivision(this.divisions)
        updateTableSystemWithKKS(this.systems)
        updateTableTypeDefect(this.type_defects)
      }, /* updateAllTables */
      updateTableConditionEquipment() {
        axios
        .post('/condition_equipment',)
        .then(response => {
            this.defect_conditions_equipment = response.data;
              }) /* axios */
      }, /* updateTableConditionEquipment */ 
      searchResponsibleMainTable(event) {
        let search = {
          dataSrch : this.dataSearch,
          dataSrchDefectID : this.dataSearchDefectID,
          dataSrchSystemKKS : this.dataSearchSystemKKS,
          dataSrch_dataSrchDefectID: false,
          dataSrch_dataSrchSystemKKS: false,
          dataSrchDefectID_dataSrchSystemKKS: false,
          event_target_ID: event.target.id,
          defectID: null,
          repairManager: null,
          system_kks: null, 
          checkTargetIdTwix(){
            if (this.event_target_ID === 'searchKSS'){  
              if (this.defectID && this.system_kks || this.repairManager && this.system_kks){
                return true
              } else {
                  if (this.system_kks === '') {
                    return this.repairManager && this.defectID ? true : false
                  } else return false
              }
            }
            if (this.event_target_ID === 'searchDefectID'){
              if (this.defectID && this.system_kks || this.repairManager && this.defectID){
                return true
              } else {
                  if (this.defectID === ''){
                    return this.repairManager && this.system_kks ? true : false
                  } else return false
              }
            }
            if (this.event_target_ID === 'searchRepairManager'){
              if (this.repairManager && this.system_kks || this.repairManager && this.defectID){
                return true
              } else {
                  if (this.repairManager === ''){
                    return this.defectID && this.system_kks ? true : false
                  } else return false
              }
            }
            return false
          },
          checkTargetIdTrinity(){
            if (this.defectID && this.system_kks && this.repairManager){
                return true
              } else return false
          },
          checkTwix() {
            if (this.dataSrch && this.dataSrchDefectID){
              this.dataSrch_dataSrchDefectID = true;
              return true;
            }
            if (this.dataSrch && this.dataSrchSystemKKS){
              this.dataSrch_dataSrchSystemKKS = true;
              return true;
            }
            if (this.dataSrchDefectID && this.dataSrchSystemKKS){
              this.dataSrchDefectID_dataSrchSystemKKS = true;
              return true;
            }
            return false;
          },
          checkTrinity(){
            if (this.dataSrch && this.dataSrchDefectID && this.dataSrchSystemKKS) return true;
            return false;
          },
        }

        if (event){
          if (event.target.id == "searchKSS"){
            this.dataSearchSystemKKS = event.target.value.toUpperCase()
          }
        }
        if (appVueDefect.pages){
          this.allDefects = true;
          this.useFilter();
          this.allDefects = false;
        } // если на странице пагинация, то сбрасываем ее и применяем фильтр
        document.dispatchEvent(new Event('resetSorting')); // сбрасываем сортировку в хедере главной таблицы сортировку
        let tempArray = {}
        let count = 0
        if (search.dataSrch === '' && search.dataSrchDefectID === '' && search.dataSrchSystemKKS === ''){
          this.useFilter();
          this.oldDefects = {};
          return
        } // если поля пустые, применяем фильтр и обнуляем oldDefects
        if (Object.keys(this.oldDefects).length === 0){
          this.oldDefects = appVueDefect.defects;
        } // если oldDefects пустой, то заполняем его текущеми дефектами с главной страницы
        searchDefects = this.oldDefects
        for (defect in searchDefects){
          if ((searchDefects[defect].responsible && search.dataSrch !== '') || (search.dataSrchDefectID !== '') || (search.dataSrchSystemKKS !== '')){
            search.defectID = searchDefects[defect].defect_id.includes(this.dataSearchDefectID) ? this.dataSearchDefectID : false // тащим в лок. перем. номер дефекта, если он есть 
            if (searchDefects[defect].responsible){
              search.repairManager = searchDefects[defect].responsible.toUpperCase().includes(this.dataSearch.toUpperCase()) ? this.dataSearch : false 
            } else repairManager = false // тащим в лок. переменную Ответсвенного за статус, если он есть
            if (searchDefects[defect].defect_system.system_kks){
              search.system_kks = searchDefects[defect].defect_system.system_kks.toUpperCase().includes(this.dataSearchSystemKKS.toUpperCase()) ? this.dataSearchSystemKKS : false 
            } else system_kks = false // тащим в лок. переменную Ответсвенного за статус, если он есть
            if (search.checkTrinity()){
              if (search.checkTargetIdTrinity()){
                tempArray[count] = searchDefects[defect];
                count ++;
                continue;
              }
            } else if (search.checkTwix()){
                if (search.checkTargetIdTwix()){
                  tempArray[count] = searchDefects[defect];
                  count ++;
                  continue;
                }
              } else {
                if (search.defectID || search.repairManager || search.system_kks){
                  tempArray[count] = searchDefects[defect];
                  count ++;
                }
              }
          } // Если поле "Ответственный на текущем статусе", либо поиск по Отвест., либо поиск по номеру, либо поиск по KKS не ПУСТЫЕ, иначе пропускаем итерацию
        }
        appVueDefect.defects = tempArray

      },

      useFilter(event) {
        if (event){
          if (event.target.id == "searchKSS"){
            this.dataSearchSystemKKS = event.target.value.toUpperCase()
          }
        }
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
        if (this.dataSearch || this.dataSearchDefectID || this.dataSearchSystemKKS){
          this.dataSearch = '';
          this.dataSearchDefectID = '';
          this.dataSearchSystemKKS = '';
        }
        axios
          .post('/get_defect_by_filter/', 
            {"date_start": this.startDate,
             "date_end": this.endDate,
             "srok_date": this.srokDate,
             "division_id": this.filterDivision,
             "repair_division_id": this.filterRepairDivision,
             "status_id": this.filterStatusDefect,
             "kks": null,
             "ppr": this.ppr === true ? true : null,
             "pnr": this.pnr === true ? true : null,
             "overdue": this.overdue === true ? true : null,
             "allDefects": this.allDefects === true ? true : null,
             "safety": this.safety === true ? true : null,
             "exploitation": this.exploitation === true ? true : null,
             "type_defect_id":  this.filterType,
             "condition_equipment_id":  this.filterCondition,
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
                responsible = appVueDefect.defects[defect].defect_repair_manager.user_surname +
                ' ' + appVueDefect.defects[defect].defect_repair_manager.user_name +
                " (" + appVueDefect.defects[defect].defect_repair_manager.user_division_name + ")";
              } else if (appVueDefect.defects[defect].defect_status.status_defect_name === 'Назначен исполнитель' || appVueDefect.defects[defect].defect_status.status_defect_name === 'Принят в работу'){
                responsible = appVueDefect.defects[defect].defect_worker.user_surname +
                ' ' + appVueDefect.defects[defect].defect_worker.user_name +
                " (" + appVueDefect.defects[defect].defect_worker.user_division_name + ")";
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
                finish_date == date_srok_filter;
              } 

            }
            appVueDefect.pages = 0;

            if (this.dataSearch !== ''){
              this.searchResponsibleMainTable(null)
              return
            }

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