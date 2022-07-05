const userdata = require('./userdata.js')
var user_data_flag = false;

const involentary = new userdata({
    session_length: null,
    location: null,
    device: null,
    browser: null,
    OS: null,
    version: null
  })

exports.collect_passed = function collect_passed(data, ip){
        involentary.device = data.device;
        involentary.browser = data.browser;
        involentary.OS = data.OS;
        involentary.version = data.version;
        involentary.location = ip;
        user_data_flag = true;

}

exports.submit_userdata = function submit_userdata(length){
if(user_data_flag == true){
    involentary.session_length = length;
    involentary.save();
}
}


