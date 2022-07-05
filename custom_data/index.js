const custom = require('./custom.js')

module.exports = function create_custom(data){
    const custom_data = new custom({
        label: data.label,
        payload: data.payload,
        version: data.version
      })

      return custom_data;
}

