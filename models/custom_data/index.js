const custom = require("./custom.js");

module.exports = function create_custom(data, id) {
  const custom_data = new custom({
    session_id: id,
    label: data.label,
    payload: data.payload,
    version: data.version,
  });

  custom_data.save();
};
