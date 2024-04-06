const appVueNav = Vue.createApp({
  data() {
    return {
      currentUserRole: '',
      isDisabledAddDefect: false,
      isHiddenUsers: false 
    }
  }, 
  mounted() {
    this.setPopover();
  },  /* mounted */
  methods: { 
    showModalUsers(){
      appVueUser.updateAllTables();
    }, /* showModalUsers */
    setPopover(){
      $(document).ready(function(){
        if($("#add-button").is(":disabled")){
          $('[data-toggle="popover"]').popover({
          placement : 'top'
        });
        }
      });
    }, /* setPopover */
    exportExcel(){
      exportExcelDefects();
    }, /* exportExcel */
    exportPDF(){
      exportPDFcurrentPage();
    }, /* exportPDF */
  },  
  beforeMount() {
    axios
    .post('/user/user_role')
    .then(response => {
        this.currentUser = response.data;
        this.currentUserRole = this.currentUser.user_role;
        if (!this.currentUserRole.includes('Администратор')) {
          this.isHiddenUsers = true;
        }
        if (!this.currentUserRole.includes('Администратор') && !this.currentUserRole.includes('Регистратор')) {
          this.isDisabledAddDefect = true;
        }
      })
  },
}).mount('#vueNav');


/* ['Регистратор', 'Владелец', 'Руководитель', 'Исполнитель', 'Инспектор', 'Администратор'] */