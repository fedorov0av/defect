const appCancelDefect = Vue.createApp({
    data() {
        return {
          textLength: 0,
          defect_id: '0',
          parent_button_close_modal_name: '', 
          statuses_defect:{}, /* ['Зарегистрирован' - 0, 'Адресован' - 1, 'Назначен исполнитель' - 2, 'Принят в работу' - 3, 'Работы завершены' - 4, 
                                  'Устранен' - 5, 'Не устранен' - 6, 'Требует решения' - 7, 'Отменен' - 8, 'Закрыт' - 9, 'Локализован' - 10,] */
          cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */
          cardDefectID: '', /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
          cardComment: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
        }
      },
      mounted() {
        this.clearData()
        this.setLimit()
        updateTableStatusDefect(this.statuses_defect);
        var myModal = document.getElementById('CancelDefectModalWindow')
        myModal.addEventListener('hidden.bs.modal', function (event) {
            appCancelDefect.clearData();
      })
      }, 
      methods: {
        changeTextCorrection(event){
          if (event.target.value){
            event.target.value = event.target.value.slice(0, 200);
          }
        }, /* changeTextWork */
        setLimit(){
          var myText = document.getElementById("cancel-text");
          var result = document.getElementById("cancel-result");
          var limit = 200;
          result.textContent = 0 + "/" + limit;
          myText.addEventListener('keypress',function(){
          result.textContent = this.textLength + 1 + "/" + limit;
          });
        }, /* setlimit*/
        clearData() {
          this.textLength = 0;
          this.setLimit()
          this.defect_id = '0';
          this.cardComment = '';
          this.parent_button_close_modal_name = '';
        }, /* clearData */
        cancelDefect() {
          if (this.cardComment == '') {
            Swal.fire({html:"<b>Отсутствует комментарий</b>", heightAuto: false}); 
            return;  /* Если комментарий не заполнен, то выходим из функции */
          }
          Swal.fire({
            title: "Сохранить комментарий?",
            showDenyButton: true,
            confirmButtonText: "ДА",
            denyButtonText: `НЕТ`
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              data = {
                "defect_id": {
                  "defect_id": this.defect_id
                },
                "status_name": {
                  "status_defect_name": this.statuses_defect[8].status_defect_name
                },
                "comment": {
                  "comment": 'Комментарий для отмененного дефекта: ' + this.cardComment
                }
              }
              axios
              .post('/update_status_defect', data)
              .then(response => {
                  document.getElementById('closeCorrectionDefectModalWindow').click();
                  /* appVueDefect.updateTables() */
                  appVueFilter.useFilter()

                  Swal.fire("Комментарий сохранен!", "", "success");
                  document.getElementById(this.parent_button_close_modal_name).click();
                  document.getElementById('closeCancelDefectModalWindow').click();
                    }) /* axios */
              .catch(err => {
                      if (err.response.status === 401){
                        window.location.href = "/";
                      } else {
                        Swal.fire({html:"<b>Произошла ошибка при сохранении комментария! Обратитесь к администратору!</b>", heightAuto: false}); 
                        console.log(err);
                      }
                  }) /* axios */
              }
          });
        },/* cancelDefect */
      },  
  }).mount('#vueCancelDefect')