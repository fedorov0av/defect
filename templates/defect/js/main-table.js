
const appVueDefect = Vue.createApp({
    data() {
      return {
        colunmsName: ['№', 'Дата регистрации', 'Срок устранения', 'Подразделение-владелец', 'KKS', 'Оборудование', 'Описание дефекта', 'Статус',  'Ответственный'],
        defect_divisions: {},
        defect_type_defects: {},
        defects: {},

      }
    },
    mounted() {
      this.updateTableDefect()
    },  /* mounted */
    methods: {
      updateTables(){
        this.updateTableDefect()
      },
      updateTableDefect() {
        axios
        .post('/defects',)
        .then(response => {
            this.defects = response.data;
            console.log(this.defects);
              }) /* axios */
      }, /* updateTableDefect */
      handleDoubleClick (event){
        console.log(event)
        console.log(event.target.parentNode.childNodes[0].textContent) 
        defect_id = event.target.parentNode.childNodes[0].textContent
        console.log(defect_id);
        appConfirmDefect.defect_id = defect_id;
        appConfirmDefect.updateTables()
        var myModal = new bootstrap.Modal(document.getElementById('ConfirmDefectModalWindow'), {
          keyboard: false
        })
        myModal.show()
      }, /* handleDoubleClick */
      },
      },
    ).mount('#vueDefect')
