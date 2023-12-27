
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
        status_name = event.target.parentNode.childNodes[7].textContent
        if (status_name == "Зарегистрирован" || status_name == "Требует корректировки") {
          console.log(defect_id);
          appConfirmDefect.defect_id = defect_id;
          appConfirmDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('ConfirmDefectModalWindow'), {
            keyboard: false
          })
          myModal.show()
        } 
        if (status_name == "Подтвержден" || status_name == "Не устранен") {
          console.log(defect_id);
          appAcceptDefect.defect_id = defect_id;
          appAcceptDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('AcceptModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Назначен исполнитель") {
          console.log(defect_id);
          appExecutionDefect.defect_id = defect_id;
          appExecutionDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('ExecutionModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Принят в работу") {
          console.log(defect_id);
          appFinishWorkDefect.defect_id = defect_id;
          appFinishWorkDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('FinishWorkModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Работы завершены") {
          console.log(defect_id);
          appCheckDefect.defect_id = defect_id;
          appCheckDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('CheckModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        
      }, /* handleDoubleClick */
      },
      },
    ).mount('#vueDefect')
