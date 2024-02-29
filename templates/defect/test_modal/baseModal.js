const appBaseModal = Vue.createApp({
    data() {
      return {
        isHiddenblockmain: ''
      }
    }, 
    methods: { 
      setDefectID(defectID){
        this.cardDefectID = defectID
      }, /* setDefectID */
    },
  }).mount('#vueBaseModal');