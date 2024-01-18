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
    },
    setPopover(){
      $(document).ready(function(){
        if($("#add-button").is(":disabled")){
          $('[data-toggle="popover"]').popover({
          placement : 'top'
        });
        }
      });
    } /* setPopover */
  },  
  beforeMount() {
    axios
    .post('/user/user_role')
    .then(response => {
        this.currentUser = response.data;
        this.currentUserRole = this.currentUser.user_role;
        if (this.currentUserRole != 'Администратор') {
          this.isHiddenUsers = true;
        }
        if (this.currentUserRole != 'Администратор' && this.currentUserRole != 'Регистратор') {
          this.isDisabledAddDefect = true;
        }
        console.log('Роль пользователя в системе: ' + this.currentUser.user_role);
      })
  },
}).mount('#vueNav');


/* ['Регистратор', 'Владелец', 'Руководитель', 'Исполнитель', 'Инспектор', 'Администратор'] */