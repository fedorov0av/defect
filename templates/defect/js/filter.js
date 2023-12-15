const appVueFilter = Vue.createApp({
    data() {
      return {
        divisions: {}, 
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
        }, /* methods */
    mounted() {
        this.updateAllTables()
    }, /* mounted */
      },
  ).mount('#vueFilter')