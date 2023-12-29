const appVueFilter = Vue.createApp({
    data() {
      return {
        divisions: {}, 
        statuses_defect: {}, 

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
              console.log(this.divisions);
                }) /* axios */
        }, /* updateTableDivision */
        updateAllTables() {
          this.updateTableDivision();
        }, /* updateAllTables */
        useFilter() {
          this.updateTableDivision();
        }, /* updateAllTables */
        updateTableStatusDefect() {
          axios
          .post('/statuses_defect',)
          .then(response => {
              this.statuses_defect = response.data;
              console.log(this.statuses_defect);
                }) /* axios */
        }, /* updateTableStatusDefect */
        }, /* methods */
        
    mounted() {
        this.updateAllTables()
        this.updateTableStatusDefect()
    }, /* mounted */
      },
  ).mount('#vueFilter')