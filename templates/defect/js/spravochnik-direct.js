const appVueSpravochnikDirect = Vue.createApp({
    data() {
      return {
        parentVueObject: {},
        accordion1: [],
        accordion2: [],
        accordion3: [],
        accordion4: [],
        accordion5: [],
        accordion6: [],
        accordion7: [],
        accordion8: [],
        accordion1Header: '',
        accordion2Header: '',
        accordion3Header: '',
        accordion4Header: '',
        accordion5Header: '',
        accordion6Header: '',
        accordion7Header: '',
        accordion8Header: '',
        // isHiddenblockcods11: 'false',
        // isHiddenblockcods22: 'true',
        // isHiddenblockcods33: 'true',
        // backgroundPage11CCS: "active",
        // backgroundPage22CCS: "nav-link",
        // backgroundPage33CCS: "nav-link",
      }
    },
    methods: {
      async fetchCategoriesDirectReason() {
        try {
          const response = await axios.post('/get_categories_direct_reason/');
          const data = response.data;
          this.accordion1 = data.filter(item => item.category_reason_code.startsWith('5.1.1.'));
          this.accordion2 = data.filter(item => item.category_reason_code.startsWith('5.1.2.'));
          this.accordion3 = data.filter(item => item.category_reason_code.startsWith('5.1.3.'));
          this.accordion4 = data.filter(item => item.category_reason_code.startsWith('5.1.4.'));
          this.accordion5 = data.filter(item => item.category_reason_code.startsWith('5.1.5.'));
          this.accordion6 = data.filter(item => item.category_reason_code.startsWith('5.1.6.'));
          this.accordion7 = data.filter(item => item.category_reason_code.startsWith('5.1.7.'));
          this.accordion8 = data.filter(item => item.category_reason_code.startsWith('5.1.8.'));

          const accordion1HeaderItem = data.find(item => item.category_reason_code === '5.1.1.');
          if (accordion1HeaderItem) {
            this.accordion1Header = accordion1HeaderItem.category_reason_name;
          }
          const accordion2HeaderItem = data.find(item => item.category_reason_code === '5.1.2.');
          if (accordion2HeaderItem) {
            this.accordion2Header = accordion2HeaderItem.category_reason_name;
          }
          const accordion3HeaderItem = data.find(item => item.category_reason_code === '5.1.3.');
          if (accordion3HeaderItem) {
            this.accordion3Header = accordion3HeaderItem.category_reason_name;
          }
          const accordion4HeaderItem = data.find(item => item.category_reason_code === '5.1.4.');
          if (accordion4HeaderItem) {
            this.accordion4Header = accordion4HeaderItem.category_reason_name;
          }
          const accordion5HeaderItem = data.find(item => item.category_reason_code === '5.1.5.');
          if (accordion5HeaderItem) {
            this.accordion5Header = accordion5HeaderItem.category_reason_name;
          }
          const accordion6HeaderItem = data.find(item => item.category_reason_code === '5.1.6.');
          if (accordion6HeaderItem) {
            this.accordion6Header = accordion6HeaderItem.category_reason_name;
          }
          const accordion7HeaderItem = data.find(item => item.category_reason_code === '5.1.7.');
          if (accordion7HeaderItem) {
            this.accordion7Header = accordion7HeaderItem.category_reason_name;
          }
          const accordion8HeaderItem = data.find(item => item.category_reason_code === '5.1.8.');
          if (accordion8HeaderItem) {
            this.accordion8Header = accordion8HeaderItem.category_reason_name;
          }
        } catch (error) {
          console.error(error);
        }
      },
      updateDirectClassification(row) {
        let code = row.category_reason_code;
        let name = row.category_reason_name;
        this.parentVueObject.newDirectClassificationCode = code;
        this.parentVueObject.newDirectClassificationCode = name;
        var myModalEl = document.getElementById('SpavochnikModalWindowDirect');
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
      },
      // clicklinkpage11 () {
      //   this.isHiddenblockcods11 = 'false';
      //   this.isHiddenblockcods22 = 'true';
      //   this.isHiddenblockcods33 = 'true';
      //   this.backgroundPage11CCS = "active";
      //   this.backgroundPage22CCS = "nav-link";
      //   this.backgroundPage33CCS = "nav-link";
      // },
      // clicklinkpage22 () {
      //   this.isHiddenblockcods11 = 'true';
      //   this.isHiddenblockcods22 = 'false';
      //   this.isHiddenblockcods33 = 'true';
      //   this.backgroundPage11CCS = "nav-link";
      //   this.backgroundPage22CCS = "active";
      //   this.backgroundPage33CCS = "nav-link";
      // },
      // clicklinkpage33 () {
      //   this.isHiddenblockcods11 = 'true';
      //   this.isHiddenblockcods22 = 'true';
      //   this.isHiddenblockcods33 = 'false';
      //   this.backgroundPage11CCS = "nav-link";
      //   this.backgroundPage22CCS = "nav-link";
      //   this.backgroundPage33CCS = "active";
      // },
    },
    mounted() {
      this.parentVueObject = appCloseDefect;
      this.fetchCategoriesDirectReason();
    },
  },
).mount('#VueSpravochnikDirect')

