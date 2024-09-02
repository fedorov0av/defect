function updateTableWorkers(workers, acceptDefect=false) {
    axios
        .post('/user/workers',)
        .then(response => {
            Object.assign(workers, response.data);
            if (acceptDefect){
                axios
                .post('/user/me',)
                .then(response => {
                    workers[workers.constructor.values.length+1] = response.data;
                    Object.assign(workers, workers);
                    }) /* axios */
            }
              }) /* axios */
    } /* updateTableWorkers */

function updateTableDivision(defect_divisions) {
    axios
        .post('/divisions',)
        .then(response => {
            Object.assign(defect_divisions, response.data);
            }) /* axios */
    } /* updateTableDivision */

function updateTableSystem(defect_systems) {
      axios
          .post('/systems',)
          .then(response => {
              Object.assign(defect_systems, response.data);
              }) /* axios */
    } /* updateTableSystem */
  
function updateTableSystemWithKKS(defect_systems) {
      axios
          .post('/systems_with_kks',)
          .then(response => {
              Object.assign(defect_systems, response.data);
              }) /* axios */
    } /* updateTableSystemWithKKS */
  
function updateTableTypeDefect(defect_type_defects) {
    axios
        .post('/type_defect',)
        .then(response => {
            Object.assign(defect_type_defects, response.data);
            }) /* axios */
    } /* updateTableTypeDefect */

function updateTableRepairManagers(repair_managers) {
    axios
        .post('/user/repair_managers',)
        .then(response => {
            Object.assign(repair_managers, response.data);
            }) /* axios */
    } /* updateTableRepairManagers */

function updateTableStatusDefect(statuses_defect) {
    axios
        .post('/statuses_defect',)
        .then(response => {
            Object.assign(statuses_defect, response.data);
            }) /* axios */
    } /* updateTableStatusDefect */

function updateCategoriesDefect(categories_defect) {
        axios
        .post('/get_categories_defect',)
        .then(response => {
            Object.assign(categories_defect, response.data);
            }) /* axios */
      } /* updateCategoriesDefect */

function updateTableHistory(defect_id, cardHistorys) {
        axios
        .post('/history_by_defect',{
          "defect_id": defect_id,
        })
        .then(response => {
            Object.assign(cardHistorys, response.data);
              }) /* axios */
        .catch(err => {
                if (err.response.status === 401){
                  window.location.href = "/";
                } else {
                Swal.fire({html:"<b>Произошла ошибка при выводе ИСТОРИИ ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                console.log(err);
                }
            }) /* axios */
    } /* updateTableHistory */


    
/* ###### Категория дефекта ########## */

function updateCategoriesReason(categories_reason) {
    axios
    .post('/get_categories_core_reason',)
    .then(response => {
        Object.assign(categories_reason, response.data);
        }) /* axios */
    } /* updateCategoriesReason */

function updateCategoriesReasonDirect(categories_reason_direct) {
    axios
    .post('/get_categories_direct_reason',)
    .then(response => {
        Object.assign(categories_reason_direct, response.data);
        }) /* axios */
    } /* updateCategoriesReason */
    
/* ################################### */

function setSortTableDafects(defects){
    dataTable = []
    for (defect in defects){
        dataTable.push(
            {
                defect_id: defect.defect_id,
                defect_created_at: defect.defect_created_at,
                defect_planned_finish_date: defect.defect_planned_finish_date,
                defect_owner: defect.defect_owner,
                defect_system_kks: defect.defect_system.system_kks,
                system_name: defect.defect_system.system_name,
                defect_description: defect.defect_description,
                status_defect_name: defect.defect_status.status_defect_name,
                responsible: defect.responsible,
            }
        )
    }
    $('#mainTable').bootstrapTable({
        columns: [{
          field: 'defect_id',
          title: '№'
        }, {
          field: 'defect_created_at',
          title: 'Дата регистрации'
        }, {
          field: 'defect_planned_finish_date',
          title: 'Срок устранения'
        }, {
          field: 'defect_owner',
          title: 'Подразделение-владелец'
        }, {
          field: 'defect_system_kks',
          title: 'KKS'
        }, {
          field: 'system_name',
          title: 'Оборудование'
        }, {
          field: 'defect_description',
          title: 'Описание дефекта'
        }, {
          field: 'status_defect_name',
          title: 'Статус'
          }, {
          field: 'responsible',
          title: 'Ответственный'
        }],
        data: dataTable,
      })
}