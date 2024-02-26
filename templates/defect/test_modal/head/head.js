const appHead = Vue.createApp({
    data() {
      return {
        cardDefectID: ''
      }
    }, 
    methods: { 
      setDefectID(defectID){
        this.cardDefectID = defectID
      }, /* setDefectID */
    },
  }).mount('#headVue');
  