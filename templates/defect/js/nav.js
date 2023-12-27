const appVueNav = Vue.createApp({
    data() {
      return {
        currentUser: {},
      }
    },
    methods: {
      showModalUsers(){
          appVueUser.updateAllTables();
      },
    },
  }).mount('#vueNav')