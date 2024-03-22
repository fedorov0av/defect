const appVueSpravochnikCore = Vue.createApp({
    data() { 
      return {
        isHiddenblockcods1: 'false',
        isHiddenblockcods2: 'true',
        isHiddenblockcods3: 'true',
        backgroundPage1CCS: "active",
        backgroundPage2CCS: "nav-link",
        backgroundPage3CCS: "nav-link",
      }
    },
    methods: {
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
  },
).mount('#VueSpravochnikCore')

