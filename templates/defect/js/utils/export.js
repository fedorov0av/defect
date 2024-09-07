function runExportHistoryExcel(defect_id){
    Swal.fire({
      title: "Выгрузить карточку дефекта в файл Excel?",
      showDenyButton: true,
      confirmButtonText: "ПОДТВЕРЖДАЮ",
      denyButtonText: `ОТМЕНА`
    }).then((result) => { 
      if (result.isConfirmed) {
        axios({
          url: '/export_history_excel_defect',
          data: {
            "defect_id": defect_id
          },
          method: 'POST',
          responseType: 'blob', // Важно указать responseType как 'blob' для скачивания файла
        })
        .then(response => {
          // Создаем ссылку для скачивания файла
          let today = new Date();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          /* link.setAttribute('download', ('history_defects_'+today.getDate()+'_'+(parseInt(today.getMonth())+1)+'_'+today.getFullYear()+'.xlsx')); // Установите желаемое имя файла */
          link.setAttribute('download', ('Defect №' + defect_id + '.xlsx')); // Установите желаемое имя файла
          document.body.appendChild(link);
          link.click();
          Swal.fire("Карточка дефекта выгружена в каталог 'Загрузки' на ваш компьютер!", "", "success");
        })
          .catch(error => {
            if (err.response.status === 401){
              window.location.href = "/";
            } else {
            console.error(error);
            }
          });
        }
    });
  } /* exportHistoryExcel */

function exportExcelDefects(){
  Swal.fire({
    title: "Выгрузить журнал дефектов в файл Excel?",
    showDenyButton: true,
    confirmButtonText: "ПОДТВЕРЖДАЮ",
    denyButtonText: `ОТМЕНА`
  }).then((result) => {
    if (result.isConfirmed) {
      let defect_list_ids = []
      for (defect_id in appVueDefect.defects) {
        defect_list_ids.push(appVueDefect.defects[defect_id].defect_id)
      }
      axios({
        url: '/export_excel_defect',
        data: {
          "defect_list_ids": defect_list_ids
        },
        method: 'POST',
        responseType: 'blob', // Важно указать responseType как 'blob' для скачивания файла
      })
        .then(response => {
          // Создаем ссылку для скачивания файла
          let today = new Date();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', ('defects_'+today.getDate()+'_'+(parseInt(today.getMonth())+1)+'_'+today.getFullYear()+'.xlsx')); // Установите желаемое имя файла
          document.body.appendChild(link);
          link.click();
          Swal.fire("Журнал дефектов выгружен в каталог 'Загрузки' на ваш компьютер!", "", "success");
        })
        .catch(err => {
          if (err.response.status === 401){
            window.location.href = "/";
          } else {
            Swal.fire({html:"<b>Произошла ошибка при выгрузке в Excel! Обратитесь к администратору!</b>", heightAuto: false}); 
            console.log(err);
          }
        }); /* axios */
      }
  });
  } /* exportExcelDefects */

function exportPDFcurrentPage(){
    document.getElementById('vueHead').style = 'display:none';
    document.getElementById('vueNav').style = 'display:none';
    document.getElementById('vueFilter').style = 'display:none';
    document.getElementById('footer_info').style = 'display:none';
    document.getElementById('mainTable').classList.remove('tableFixHead')
    window.print();
    document.getElementById('vueHead').style = 'display:block;';
    document.getElementById('vueNav').style = 'display:block';
    document.getElementById('vueFilter').style = 'display:block';
    document.getElementById('footer_info').style = 'display:block';
    document.getElementById('mainTable').classList.add('tableFixHead')
  } /* exportPDFcurrentPage */