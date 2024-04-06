const appVueDefect = Vue.createApp({
  data() {
    return {
      colunmsName: [
        { name: "№", key: "defect_id" },
        { name: "Дата регистрации", key: "defect_created_at" },
        { name: "Срок устранения", key: "defect_planned_finish_date" },
        { name: "Подразделение-владелец", key: "defect_owner" },
        { name: "KKS", key: "defect_system.system_kks" },
        { name: "Оборудование", key: "defect_system.system_name" },
        { name: "Описание дефекта", key: "defect_description" },
        { name: "Статус", key: "defect_status.status_defect_name" },
        { name: "Ответственный", key: "responsible" },
      ],
      defect_divisions: {},
      defect_type_defects: {},
      defects: {},
      pageNumber: 1,
      pageSize: 15,
      pages: 0,
      temp_resp: {},
      nextPageNumber: 0,
      tableData: {},
      sortDirection: 1,
      sortColumn: null,
      clicks: {},
    };
  },
  mounted() {
    this.updateTableDefect(true);
    this.currentPage = 1;
    document.addEventListener("resetSorting", () => {
      this.resetSorting();
    });
  } /* mounted */,
  methods: {
    sortTableColumn(index) {
      if (!Array.isArray(this.defects)) {
        this.defects = Object.values(this.defects);
      }

      if (this.defects.length === 0) return;

      let key = this.colunmsName[index].key; // выбор ключа для сортировки

      // проверка, если все значения в массиве одинаковы
      const firstValue = key.split(".").reduce((o, i) => o[i], this.defects[0]);
      const allSame = this.defects.every((defect) => {
        const value = key.split(".").reduce((o, i) => o[i], defect);
        return value === firstValue;
      });

      // если все значения одинаковы, то возврат исходного массива
      if (allSame) return this.defects;

      // увеличение счетчика кликов
      if (this.clicks[index]) {
        this.clicks[index]++;
      } else {
        this.clicks[index] = 1;
      }

      // отмена сортировки при третьем клике
      if (this.clicks[index] === 3) {
        this.updateTableDefect(true);
        this.sortColumn = null;
        this.sortDirection = 1;
        this.clicks[index] = 0;
        return;
      }

      // изменение направления, если клик по тому же столбцу, где уже идет сортировка
      if (this.sortColumn === index) {
        this.sortDirection = -this.sortDirection;
      } else {
        // установка столбца активным и сортировка по новому столбцу по возрастанию
        this.sortColumn = index;
        this.sortDirection = 1;
      }

      // передача двух элементов массива defects для сравнения
      this.defects.sort((a, b) => {
        // разделение строки на массив подстрок и проход по массиву ключей для извлечения значения
        // пример: объект a {defect_system: {system_kks: 'KKS1'}}, где key: defect_system.system_kks, aValue: KKS1
        let aValue = key.split(".").reduce((o, i) => o[i], a);
        let bValue = key.split(".").reduce((o, i) => o[i], b);

        if (aValue == null) return 1; // элемент a должен идти после b в отсортированном списке
        if (bValue == null) return -1; // элемент b должен идти после a в отсортированном списке

        // если тип элемента - строка, то преобразование элемента в нижний регистр
        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        return aValue < bValue
          ? -1 * this.sortDirection
          : 1 * this.sortDirection;
      });
    },
    resetSorting() {
      this.sortColumn = null;
      this.sortDirection = 1;
      this.clicks = {};
    },
    tableRowClassName({ row, rowIndex }) {
      axios.post("/user/user_role").then((response) => {
        this.currentUser = response.data;
        this.currentUserRole = this.currentUser.user_role;
        this.currentUserDivision = this.currentUser.user_division;
        /* var stat_color = document.getElementById("stat_color"); */
        if (
          rowIndex === 1 /*row.defect.defect_owner ==  this.currentUserDivision  && this.status_name == 'Зарегистрирован' */
        ) {
          return "success-row";
        }
      });
    },
    updateTables() {
      this.updateTableDefect();
      this.resetSorting();
    },
    updateTableDefect(start = false) {
      if (start) {
        appVueFilter.useFilter();
      } else {
        axios
          .post("/defects", null, {
            params: { page: 1, size: parseInt(this.pageSize) },
          })
          .then((response) => {
            /*               this.temp_resp = response.data; */
            this.pageNumber = response.data.page;
            this.pages = response.data.pages;
            this.defects = response.data.items;
            let responsible = null;
            for (defect in this.defects) {
              if (
                this.defects[defect].defect_status.status_defect_name === "Зарегистрирован" ||
                this.defects[defect].defect_status.status_defect_name === "Устранен" ||
                this.defects[defect].defect_status.status_defect_name === "Закрыт"
              ) {
                responsible = this.defects[defect].defect_owner;
              } else if (
                this.defects[defect].defect_status.status_defect_name === "Адресован" ||
                this.defects[defect].defect_status.status_defect_name === "Не устранен"
              ) {
                responsible =
                  this.defects[defect].defect_repair_manager.user_surname +
                  " " +
                  this.defects[defect].defect_repair_manager.user_name;
              } else if (
                this.defects[defect].defect_status.status_defect_name === "Назначен исполнитель" ||
                this.defects[defect].defect_status.status_defect_name === "Принят в работу"
              ) {
                responsible =
                  this.defects[defect].defect_worker.user_surname +
                  " " +
                  this.defects[defect].defect_worker.user_name;
              } else if (
                this.defects[defect].defect_status.status_defect_name === "Работы завершены"
              ) {
                responsible = "ОП " + this.defects[defect].defect_owner;
              }
              this.defects[defect].responsible = responsible;

              let date_background = null;
              if (
                this.defects[defect].defect_planned_finish_date !== "Устр. в ППР" &&
                this.defects[defect].defect_planned_finish_date !== null
              ) {
                let now = new Date();
                date_defect_finish_temp =
                  this.defects[defect].defect_planned_finish_date.split("-");
                finish_date = Date.parse(
                  date_defect_finish_temp[2] +
                    "-" +
                    date_defect_finish_temp[1] +
                    "-" +
                    date_defect_finish_temp[0]
                );
                if (finish_date - now <= 0) { 
                  date_background = "table-danger";
                } else if (finish_date - now <= 172800000) {
                  date_background = "table-warning";
                }
              }
              this.defects[defect].dateBackgroundColor = date_background;
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              window.location.href = "/";
            } else {
              Swal.fire({
                html: "<b>Произошла ошибка! Обратитесь к администратору!</b>",
                heightAuto: false,
              });
              console.log(err);
            }
          }); /* axios */
      } /* else */
    } /* updateTableDefect */,
    handleDoubleClick(event) {
      defect_id = event.target.parentNode.childNodes[0].textContent;
      status_name = event.target.parentNode.childNodes[7].textContent;
      if (
        status_name == "Зарегистрирован" ||
        status_name == "Требует корректировки" ||
        status_name == "Требует решения"
      ) {
        appConfirmDefect.defect_id = defect_id;
        appConfirmDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("ConfirmDefectModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Адресован" || status_name == "Не устранен") {
        appAcceptDefect.defect_id = defect_id;
        appAcceptDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("AcceptModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Назначен исполнитель") {
        appExecutionDefect.defect_id = defect_id;
        appExecutionDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("ExecutionModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Принят в работу") {
        appFinishWorkDefect.defect_id = defect_id;
        appFinishWorkDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("FinishWorkModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Работы завершены") {
        appCheckDefect.defect_id = defect_id;
        appCheckDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("CheckModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Устранен" || status_name == "Локализован") {
        appCloseDefect.defect_id = defect_id;
        appCloseDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("CloseModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
      if (status_name == "Закрыт" || status_name == "Отменен") {
        appCardDefect.defect_id = defect_id;
        appCardDefect.updateTables();
        var myModal = new bootstrap.Modal(
          document.getElementById("CardModalWindow"),
          {
            keyboard: false,
          }
        );
        myModal.show();
      }
    } /* handleDoubleClick */,
    changePage(event) {
      this.resetSorting();
      if (event.target.text == "Вперед") {
        this.nextPageNumber = this.pageNumber + 1;
      } else if (event.target.text == "Назад") {
        this.nextPageNumber = this.pageNumber - 1;
      } else if (event.target.tagName == "SELECT") {
        this.nextPageNumber = 1;
      } else {
        this.nextPageNumber = parseInt(event.target.text);
      }
      axios
        .post("/defects", null, {
          params: { page: this.nextPageNumber, size: parseInt(this.pageSize) },
        })
        .then((response) => {
          this.temp_resp = response.data;
          this.pageNumber = response.data.page;
          this.pages = response.data.pages;
          this.defects = response.data.items;
          for (defect in this.defects) {
            let responsible = null;
            if (
              this.defects[defect].defect_status.status_defect_name === "Зарегистрирован" ||
              this.defects[defect].defect_status.status_defect_name === "Устранен" ||
              this.defects[defect].defect_status.status_defect_name === "Закрыт"||
              /* this.defects[defect].defect_status.status_defect_name === 'Не устранен'|| */
              this.defects[defect].defect_status.status_defect_name === 'Локализован'
            ) {
              responsible = this.defects[defect].defect_owner;
            } else if (
              this.defects[defect].defect_status.status_defect_name === "Адресован" ||
              this.defects[defect].defect_status.status_defect_name === 'Не устранен'
            ) {
              responsible =
                this.defects[defect].defect_repair_manager.user_surname +
                " " +
                this.defects[defect].defect_repair_manager.user_name;
            } else if (
              this.defects[defect].defect_status.status_defect_name ===
                "Назначен исполнитель" ||
              this.defects[defect].defect_status.status_defect_name ===
                "Принят в работу"
            ) {
              responsible =
                this.defects[defect].defect_worker.user_surname +
                " " +
                this.defects[defect].defect_worker.user_name;
            } else if (
              this.defects[defect].defect_status.status_defect_name ===
              "Работы завершены"
            ) {
              responsible = "ОП " + this.defects[defect].defect_owner;
            }
            this.defects[defect].responsible = responsible;
            let date_background = null;
            if (
              this.defects[defect].defect_planned_finish_date !==
                "Устр. в ППР" &&
              this.defects[defect].defect_planned_finish_date !== null
            ) {
              let now = new Date();
              date_defect_finish_temp =
                this.defects[defect].defect_planned_finish_date.split("-");
              finish_date = Date.parse(
                date_defect_finish_temp[2] +
                  "-" +
                  date_defect_finish_temp[1] +
                  "-" +
                  date_defect_finish_temp[0]
              );
              if (finish_date - now <= 0) {
                date_background = "table-danger";
              } else if (finish_date - now <= 172800000) {
                date_background = "table-warning";
              }
            }
            this.defects[defect].dateBackgroundColor = date_background;
          }
        }); /* axios */
    } /* changePage */,
  },
}).mount("#vueDefect");
