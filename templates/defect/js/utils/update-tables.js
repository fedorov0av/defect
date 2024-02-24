function updateTableWorkers(workers, acceptDefect=false) {
    axios
        .post('/user/workers',)
        .then(response => {
            Object.assign(workers, response.data);
            if (acceptDefect){
                axios
                .post('/user/me',)
                .then(response => {
                    workers[workers.constructor.values.length] = response.data;
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

/* ################################### */