const appCorrectionDefect = Vue.createApp({
    data() {
        return {
          defect_id: '0',
          parent_button_close_modal_name: '', 
          statuses_defect:{}, /* ['Зарегистрирован', # 1
          'Подтвержден', # 2
          'Принят в работу', # 3
          'Назначен исполнитель', # 4
          'Работы завершены', # 5
          'Устранен', # 6
          'Не устранен', # 7
          'Требует корректировки', # 8
          'Отменен',  # 9
          'Закрыт',  #10
          ] */
          cardDefect: {}, /* ОБЩИЙ ОБЪЕКТ для храненения данных карточки дефекта   */
          
          cardDefectID: '', /* ID ДЕФЕКТА для храненения данных карточки дефекта   */
          cardComment: '', /* Для отображения ВЫПОЛНЕННЫЕ РАБОТЫ в карточке !! ПОКА В БД НЕТ ИНФОРМАЦИИ !!  */
        }
      },
      mounted() {
        this.updateTableStatusDefect()
        var myModal = document.getElementById('CorrectionDefectModalWindow')
        myModal.addEventListener('hidden.bs.modal', function (event) {
          appCorrectionDefect.clearData();
      })
      },
      methods: {
        clearData() {
          this.defect_id = '0';
          this.cardComment = '';
          this.parent_button_close_modal_name = '';
        }, /* clearData */
        updateTableStatusDefect() {
          axios
          .post('/statuses_defect',)
          .then(response => {
              this.statuses_defect = response.data;
                }) /* axios */
        }, /* updateTableStatusDefect */
        cancelDefect(event) {
          if (this.cardComment == '') {
            Swal.fire({html:"<b>Отсутствует комментарий</b>", heightAuto: false}); 
            return;  /* Если комментарий не заполнен, то выходим из функции */
          }
          Swal.fire({
            title: "Вы действительно хотите отправить дефект на корректировку?",
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
                  "status_defect_name": this.statuses_defect[7].status_defect_name
                },
                "comment": {
                  "comment": this.cardComment
                }
              }
              axios
              .post('/update_status_defect', data)
              .then(response => {
                  document.getElementById('closeCorrectionDefectModalWindow').click();
                  appVueDefect.updateTables()
                  /* console.log(response.data); */
                  Swal.fire("ДЕФЕКТ ОТПРАВЛЕН НА КОРРЕКТИРОВКУ", "", "success");
                  document.getElementById(this.parent_button_close_modal_name).click();
                    }) /* axios */
              .catch(err => {
                      Swal.fire({html:"<b>Произошла ошибка при ОТМЕНE ДЕФЕКТА! Обратитесь к администратору!</b>", heightAuto: false}); 
                      console.log(err);
                  }) /* axios */
              }
          });
        },/* cancelDefect */
      },  
  }).mount('#vueCorrectionDefect')