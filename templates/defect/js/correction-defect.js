const appCorrectionDefect = Vue.createApp({
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
          modalTitle: 'Корректировка дефекта',
          commentText: 'Комментарий при корректировке',
        }
      },
      mounted() {
        this.clearData()
        this.setLimit()
        updateTableStatusDefect(this.statuses_defect);
        var myModal = document.getElementById('CorrectionDefectModalWindow')
        myModal.addEventListener('hidden.bs.modal', function (event) {
          appCorrectionDefect.clearData();
      })
      }, 
      methods: {
        changeTextCorrection(event){
          if (event.target.value){
            event.target.value = event.target.value.slice(0, 200);
          }
        }, /* changeTextWork */
        setLimit(){
          var myText = document.getElementById("correction-text");
          var result = document.getElementById("correction-result");
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
          if (this.cardComment == "") {
            Swal.fire({
              html: "<b>Отсутствует комментарий</b>",
              heightAuto: false,
            });
            return;
          }
          if (appCheckDefect.isDefectLocalized) {
            let data = {
              defect_id: {
                defect_id: appCheckDefect.defect_id,
              },
              status_name: {
                status_defect_name:
                  appCheckDefect.statuses_defect[10].status_defect_name,
              },
              checker_id: {
                user_id: appCheckDefect.newCheckerId,
              },
              defect_check_result: {
                comment: this.cardComment,
              },
            };
            axios
              .post("/check_defect", data)
              .then((response) => {
                document.getElementById("closeCorrectionDefectModalWindow").click();
                appVueDefect.updateTables();
                Swal.fire("ДЕФЕКТ ЛОКАЛИЗОВАН","","success");
                document.getElementById(this.parent_button_close_modal_name).click();
                appCheckDefect.isDefectLocalized = false;
                this.modalTitle = 'Корректировка дефекта';
                this.commentText = 'Комментарий при корректировке';
              })
              .catch((err) => {
                if (err.response.status === 401) {
                  window.location.href = "/";
                } else {
                  Swal.fire({
                    html: "<b>Произошла ошибка при ЛОКАЛИЗАЦИИ ДЕФЕКТА! Обратитесь к администратору!</b>",
                    heightAuto: false,
                  });
                  console.log(err);
                }
              });
          } else {
            Swal.fire({
              title: "Вы действительно хотите отправить дефект на корректировку?",
              showDenyButton: true,
              confirmButtonText: "ДА",
              denyButtonText: `НЕТ`,
            }).then((result) => {
              if (result.isConfirmed) {
                data = {
                  defect_id: {
                    defect_id: this.defect_id,
                  },
                  status_name: {
                    status_defect_name: this.statuses_defect[7].status_defect_name,
                  },
                  comment: {
                    comment: this.cardComment,
                  },
                };
                axios
                  .post("/update_status_defect", data)
                  .then((response) => {
                    document.getElementById("closeCorrectionDefectModalWindow").click();
                    appVueDefect.updateTables();
                    Swal.fire("ДЕФЕКТ ОТПРАВЛЕН НА КОРРЕКТИРОВКУ", "", "success");
                    document.getElementById(this.parent_button_close_modal_name).click();
                  }) /* axios */
                  .catch((err) => {
                    if (err.response.status === 401) {
                      window.location.href = "/";
                    } else {
                      Swal.fire({
                        html: "<b>Произошла ошибка при ОТМЕНE ДЕФЕКТА! Обратитесь к администратору!</b>",
                        heightAuto: false,
                      });
                      console.log(err);
                    }
                  }); /* axios */
              }
            });
          }
        },/* cancelDefect */
      },  
  }).mount('#vueCorrectionDefect')