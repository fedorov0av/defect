const appVueSpravochnikCore = Vue.createApp({
    data() { 
      return {
        isHiddenblockcods1: 'false',
        isHiddenblockcods2: 'true',
        isHiddenblockcods3: 'true',
        backgroundPage1CCS: "active",
        backgroundPage2CCS: "nav-link",
        backgroundPage3CCS: "nav-link",

        parentVueObject: {},
        tab1: [],
        tab2: [],
        tab3: [],
      }
    },
    methods: {
      async fetchCategoriesCoreReason() {
        try {
          const response = await axios.post('/get_categories_core_reason/');
          const data = response.data;
          this.tab1 = data.filter(item => item.category_reason_code >= '5.2.0.' && item.category_reason_code <= '5.2.9.2.4.');
          this.tab2 = data.filter(item => item.category_reason_code >= '5.2.9.3.' && item.category_reason_code <= '5.2.9.6.2.4.1.');
          this.tab3 = data.filter(item => item.category_reason_code >= '5.2.9.6.2.4.2.' && item.category_reason_code <= '5.2.9.7.3.');
        } catch (error) {
          console.error(error);
        }
      },
      updateCoreClassification(row) {
        let code = row.category_reason_code;
        let name = row.category_reason_name;
        this.parentVueObject.newCoreClassificationCode = code;
        this.parentVueObject.newCoreClassificationName = name;
        var myModalEl = document.getElementById('SpavochnikModalWindowCore');
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
      },
      clicklinkpage1 () {
        this.isHiddenblockcods1 = 'false';
        this.isHiddenblockcods2 = 'true';
        this.isHiddenblockcods3 = 'true';
        this.backgroundPage1CCS = "active";
        this.backgroundPage2CCS = "nav-link";
        this.backgroundPage3CCS = "nav-link";
      },
      clicklinkpage2 () {
        this.isHiddenblockcods1 = 'true';
        this.isHiddenblockcods2 = 'false';
        this.isHiddenblockcods3 = 'true';
        this.backgroundPage1CCS = "nav-link";
        this.backgroundPage2CCS = "active";
        this.backgroundPage3CCS = "nav-link";
      },
      clicklinkpage3 () {
        this.isHiddenblockcods1 = 'true';
        this.isHiddenblockcods2 = 'true';
        this.isHiddenblockcods3 = 'false';
        this.backgroundPage1CCS = "nav-link";
        this.backgroundPage2CCS = "nav-link";
        this.backgroundPage3CCS = "active";
      },
    },
    mounted() {
      this.parentVueObject = appCloseDefect;
      this.fetchCategoriesCoreReason();
    },
  },
).mount('#VueSpravochnikCore')

