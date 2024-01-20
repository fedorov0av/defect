const appVueFilter = Vue.createApp({
    data() {
      return {
        divisions: {}, 
        statuses_defect: {}, 
        defects: {},

        filterDivision: 0,
        startDate: null,
        endDate: null,
        filterStatusDefect: 0,
      }
    },
    methods: {
        updateTableDivision() {
          axios
          .post('/divisions',)
          .then(response => {
              this.divisions = response.data;
                }) /* axios */
        }, /* updateTableDivision */

        updateAllTables() {
          this.updateTableDivision();
        }, /* updateAllTables */
        
        
        useFilter() {
          axios
            .post('/get_defect_by_filter/', 
              {"date_start": this.startDate,
               "date_end": this.endDate,
               "division_id":  this.filterDivision,
               "status_id":  this.filterStatusDefect
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
              appVueDefect.pages = 0;
                }) /* axios */
        }, /* useFilter */
        
        
        nouseFilter() {
          axios
          .post('/defects',)
          .then(response => {
              appVueDefect.updateTables();
                }) /* axios */
        }, /* nouseFilter */
        
        
        updateTableStatusDefect() {
          axios
          .post('/statuses_defect',)
          .then(response => {
              this.statuses_defect = response.data;
                }) /* axios */
        }, /* updateTableStatusDefect */
        }, /* methods */
        
    mounted() {
      this.updateAllTables()
      this.updateTableStatusDefect()
    }, /* mounted */
      },
  ).mount('#vueFilter')