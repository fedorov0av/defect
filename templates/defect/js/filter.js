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
        ppr: 'false'
      }
    },
    methods: {
        clearData() {
          this.filterDivision = 0;
          this.startDate = null;
          this.endDate = null;
          this.filterStatusDefect = 0;
          this.ppr = 'false';
        }, /* clearData */
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
          if (this.startDate !== null && this.endDate !== null) {
            if (this.startDate >= this.endDate) {
              Swal.fire({html:"<b>Дата окончания раньше даты начала!</b>", heightAuto: false}); 
              return;  /* Если дата или руководитель ремонта не заполнены то выходим из функции */
            }
          }

          axios
            .post('/get_defect_by_filter/', 
              {"date_start": this.startDate,
               "date_end": this.endDate,
               "division_id":  this.filterDivision,
               "status_id":  this.filterStatusDefect,
               "ppr": this.ppr === 'true' ? true : null,
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
          this.clearData();
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