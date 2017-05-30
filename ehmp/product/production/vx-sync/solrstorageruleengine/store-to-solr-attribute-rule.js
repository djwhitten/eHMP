'use strict';

function store(log, config, environment, dataDomain, record, callback) {
    log.debug('store-to-solr-attribute-rule.store: Entered function.   record: %j', record);

    callback(null, record.storeToSolr === true);
}

module.exports = store;

