const userdata = require("./userdata.js");

exports.submit_userdata2 = function submit_userdata(metadata) {
  metadata.session_end = metadata.last_disconnect_time;
  metadata.session_length = getDifferenceInSeconds(metadata.session_end, metadata.session_start);

  var involentary = new userdata({
    session_id: metadata.session_id,
    session_length: metadata.session_length,
    ip: metadata.ip,
    device: { type: metadata.device_type, model: metadata.device_model },
    browser: metadata.browser,
    OS: { name: metadata.OS, version: metadata.OS_version },
    version: metadata.version,
  });

  //console.log(metadata);
  if (involentary.version != null) {
    involentary.save().catch((err) => err);
  } else {
    console.log(`[INFO] [USER_DATA_CANT_SAVE] ip=${involentary.ip}`);
  }
};

function getDifferenceInSeconds(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / 1000;
}
