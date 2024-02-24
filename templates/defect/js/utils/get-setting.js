function setSettingClickButtonMain (appVue) {
    appVue.isHiddenblockmain = 'false';
    appVue.isHiddenblockhistory = 'true';
    appVue.isHiddenblockclassification = 'true';
    appVue.backgroundMainButtonCCS = "btn-primary";
    appVue.backgroundHistoryButtonCCS = "btn-outline-primary";
    appVue.backgroundСlassificationButtonCCS = "btn-outline-primary";
  }

function setSettingClickButtonHistory (appVue) {
    appVue.isHiddenblockmain = 'true';
    appVue.isHiddenblockhistory = 'false';
    appVue.isHiddenblockclassification = 'true';
    appVue.backgroundMainButtonCCS = "btn-outline-primary";
    appVue.backgroundHistoryButtonCCS = "btn-primary";
    appVue.backgroundСlassificationButtonCCS = "btn-outline-primary";
  }

function setSettingClickButtonClassification(appVue) {
    appVue.isHiddenblockmain = 'true';
    appVue.isHiddenblockhistory = 'true';
    appVue.isHiddenblockclassification = 'false';
    appVue.backgroundMainButtonCCS = "btn-outline-primary";
    appVue.backgroundHistoryButtonCCS = "btn-outline-primary";
    appVue.backgroundСlassificationButtonCCS = "btn-primary";
  }

function  setLimit(testId, resultId, limit, vueObject=0){
    var myText = document.getElementById(testId);
    var result = document.getElementById(resultId);
    var limit = limit;
    if (vueObject === 0) start = 0
    else start = vueObject.length
    result.textContent = start + "/" + limit;
    myText.addEventListener('input',function(){
    var textLength = myText.value.length;
    result.textContent = textLength + "/" + limit;
    });
  }