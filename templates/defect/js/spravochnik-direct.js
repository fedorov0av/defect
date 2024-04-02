const appVueSpravochnikDirect = Vue.createApp({
  data() {
    return {
      accordions: [],
      parentVueObject: null,
    }
  },
  methods: {
    async fetchCategoriesDirectReason() {
      try {
        const response = await axios.post('/get_categories_direct_reason/');
        const data = response.data;
        const groupedData = data.reduce((acc, item) => {
          const key = item.category_reason_code.split('.').slice(0, 3).join('.');
          if (!acc[key]) {
            acc[key] = {
              header: `${key}. ${item.category_reason_name}`,
              items: [],
            };
          }
          if (!item.category_reason_code.match(/^\d+\.\d+\.\d+\.$/)) {
            acc[key].items.push(item);
          }
          return acc;
        }, {});

        this.accordions = Object.values(groupedData).map((accordion, index) => {
          accordion.items.unshift({ isHeader: true });
          return { ...accordion, expanded: index === 0 };
        });
      } catch (error) {
        console.error(error);
      }
    },
    updateDirectClassification(row) {
      if (!this.parentVueObject) return;

      let code = row.category_reason_code;
      let name = row.category_reason_name;
      this.parentVueObject.newDirectClassificationCode = code;
      this.parentVueObject.newDirectClassificationName = name;
      var myModalEl = document.getElementById('SpavochnikModalWindowDirect');
      var modal = bootstrap.Modal.getInstance(myModalEl);
      modal.hide();
    },
  },
  mounted() {
    this.fetchCategoriesDirectReason();
  }
}).mount('#VueSpravochnikDirect');
