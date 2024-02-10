const appVueDefect = Vue.createApp({
  /* components: {
    VueTailwindPagination,
  }, */
    data() {
      return {
        colunmsName: ['№', 'Дата регистрации', 'Срок устранения', 'Подразделение-владелец', 'KKS', 'Оборудование', 'Описание дефекта', 'Статус',  'Ответственный'],
        defect_divisions: {},
        defect_type_defects: {},
        defects: {},
        pageNumber: 1,
        pageSize: 15,
        pages: 0,
        temp_resp: {},
        nextPageNumber: 0,
      }
    },

    mounted() {
      this.updateTableDefect(true);
      this.currentPage = 1;
    },  /* mounted */
    methods: {    
      tableRowClassName({row, rowIndex}) {
        axios
        .post('/user/user_role')
        .then(response => {
            this.currentUser = response.data;
            this.currentUserRole = this.currentUser.user_role;
            this.currentUserDivision = this.currentUser.user_division;
            /* var stat_color = document.getElementById("stat_color"); */
            if ( rowIndex === 1  /*row.defect.defect_owner ==  this.currentUserDivision  && this.status_name == 'Зарегистрирован' */) {
              return 'success-row';
            }
          })
      },
      updateTables(){
        this.updateTableDefect()
      },
      updateTableDefect(start = false) {
        if (start){ 
          appVueFilter.useFilter(); 
        }
        else {
          axios
          .post('/defects', null, {params:{'page': 1, 'size': parseInt(this.pageSize)}})
          .then(response => {
              this.temp_resp = response.data;
              this.pageNumber = response.data.page;
              this.pages = response.data.pages;
              this.defects = response.data.items;
                })
          .catch(err => {
            if (err.response.status === 401){
              window.location.href = "/";
            } else {
              Swal.fire({html:"<b>Произошла ошибка! Обратитесь к администратору!</b>", heightAuto: false}); 
              console.log(err);
            }
          }); /* axios */
            } /* else */
      }, /* updateTableDefect */
      handleDoubleClick (event){
        defect_id = event.target.parentNode.childNodes[0].textContent
        status_name = event.target.parentNode.childNodes[7].textContent
        if (status_name == "Зарегистрирован" || status_name == "Требует корректировки" || status_name == "Требует решения") {
          appConfirmDefect.defect_id = defect_id;
          appConfirmDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('ConfirmDefectModalWindow'), {
            keyboard: false
          })
          myModal.show()
        } 
        if (status_name == "Адресован" || status_name == "Не устранен") {
          appAcceptDefect.defect_id = defect_id;
          appAcceptDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('AcceptModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Назначен исполнитель") {
          appExecutionDefect.defect_id = defect_id;
          appExecutionDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('ExecutionModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Принят в работу") {
          appFinishWorkDefect.defect_id = defect_id;
          appFinishWorkDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('FinishWorkModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Работы завершены") {
          appCheckDefect.defect_id = defect_id;
          appCheckDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('CheckModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Устранен") {
          appCloseDefect.defect_id = defect_id;
          appCloseDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('CloseModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        if (status_name == "Закрыт" || status_name == "Отменен") {
          appCardDefect.defect_id = defect_id;
          appCardDefect.updateTables()
          var myModal = new bootstrap.Modal(document.getElementById('CardModalWindow'), {
            keyboard: false
          })
          myModal.show()
        }
        
      }, /* handleDoubleClick */
      changePage (event){
        if (event.target.text == 'Вперед'){
          this.nextPageNumber = this.pageNumber + 1;
        }
        else if (event.target.text == 'Назад'){
          this.nextPageNumber = this.pageNumber - 1;
        }
        else if (event.target.tagName == 'SELECT'){
          this.nextPageNumber = 1;
        } else {
          this.nextPageNumber = parseInt(event.target.text);
        }
        axios
        .post('/defects', null, { params:{'page': this.nextPageNumber, 'size': parseInt(this.pageSize)}})
        .then(response => {
            this.temp_resp = response.data;
            this.pageNumber = response.data.page;
            this.pages = response.data.pages;
            this.defects = response.data.items;
              }) /* axios */
      }, /* changePage */
    },
  },
).mount('#vueDefect')
