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