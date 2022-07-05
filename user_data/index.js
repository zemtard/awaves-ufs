const userdata = require('./userdata.js')
var user_data_flag = false;

const involentary = new user_data({
    session_length: null,
    location: null,
    device: null,
    browser: null,
    OS: null,
    version: null
  })

module.exports = function create_userdata(data){
    if(user_data_flag == false){
        involentary.device = data.device;
        involentary.browser = data.browser;
        involentary.OS = data.OS;
        involentary.version = data.version;
    }

    if(user_data_flag == true){

    }
   
}

module.exports = involentary;