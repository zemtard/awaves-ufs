const userdata = require('./userdata.js')

exports.submit_userdata2 = function submit_userdata(metadata){
    
    var involentary = new userdata({
        session_length: metadata.session_length,
        ip: metadata.ip,
        device : {type: metadata.device_type, model: metadata.device_model},
        browser: metadata.browser,
        OS: {name : metadata.OS, version: metadata.OS_version},
        version: metadata.version
      }) 

      console.log(metadata)
    involentary.save();
}


