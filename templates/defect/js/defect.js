const appVueAddDefect = Vue.createApp({
    data() {
      return {
        defect_divisions: {},
        defect_type_defects: {},

        vueAddUserModalWindow: Vue.ref('vueAddUserModalWindow'),

        newSystemName: '',
        newSystemKKS: '',
        newDefectNotes: '',
        newLocation: '',
        newTypeDefect: '',
        newDivisionOwner: '',
      }
    },
    mounted() {
      this.updateTableDivision()
      this.updateTableTypeDefect()
      var myModalEl = document.getElementById('AddDefectModalWindow')
      myModalEl.addEventListener('hidden.bs.modal', function (event) {
        appVueAddDefect.clearData();
        appVueDefect.updateTables();
    })
    },
    methods: {
      closeAddDefectModalWindow() {
        this.clearData();
      }, /* closeAddDefectModalWindow */
      clearData() {
        this.newSystemName = '';
        this.newSystemKKS = '';
        this.newDefectNotes = '';
        this.newLocation = '';
        this.newTypeDefect = '';
        this.newDivisionOwner = '';
      }, /* clearData */
      updateTableDivision() {
        axios
        .post('/divisions',)
        .then(response => {
            this.defect_divisions = response.data;
              }) /* axios */
      }, /* updateTableDivision */
      updateTableTypeDefect() {
        axios
        .post('/type_defect',)
        .then(response => {
            this.defect_type_defects = response.data;
              }) /* axios */
      }, /* updateTableTypeDefect */
      addNewDefect() {
        if (this.newSystemName == '' || this.newDefectNotes == '' || this.newTypeDefect == ''){
              Swal.fire({html:"<b>Все значения (кроме KSS и Местоположения) должны быть заполнены</b>", heightAuto: false}); 
        } /* if */
        else {
          axios
          .post('/defect/add', 
              {
                "defect_description": this.newDefectNotes,
                "defect_system_name": this.newSystemName,
                "defect_system_kks": this.newSystemKKS,
                "defect_type_defect_name": this.newTypeDefect,
                "defect_location": this.newLocation
              }
          )
          .then(response => {
              /* console.log(response.data); */
              Swal.fire({html:"<b>Дефект добавлен</b>", heightAuto: false}); 
              document.getElementById('closeModalAddDefect').click();
                })
          .catch(err => {
              Swal.fire({html:"<b>Произошла ошибка при добавлении дефекта. Обратитесь к администратору.</b>", heightAuto: false}); 
              console.log(err);
          }) /* axios */
        } /* else */
      }, /* addNewDefect */

      },
      },
    ).mount('#vueAddDefect')

