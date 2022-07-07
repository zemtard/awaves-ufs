const userdata = require('./userdata.js')

exports.submit_userdata2 = function submit_userdata(metadata){
    
    var involentary = new userdata({
        session_length: metadata.session_length,
        ip: metadata.ip,
        device: metadata.device,
        browser: metadata.browser,
        OS: metadata.OS,
        version: metadata.version
      }) 

    involentary.save();
}


