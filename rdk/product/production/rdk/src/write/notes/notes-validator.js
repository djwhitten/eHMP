'use strict';
var _ = require('lodash');
var encryptor = require('../orders/common/orders-sig-code-encryptor');
var nullchecker = require('../../utils/nullchecker');
var fmDateUtil = require('../../utils/fileman-date-converter');
var httpUtil = require('../../core/rdk').utils.http;
var rpcClientFactory = require('../core/rpc-client-factory');
var async = require('async');
var clinicalObjUtil = require('../../subsystems/clinical-objects/clinical-objects-wrapper-note');
var clinicalObjSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var asu = require('../../subsystems/asu/asu-process');

module.exports.checkIfCosignRequired = function(writebackContext, callback) {

    var ERROR_RESPONSE = 'This note title requires that a cosigner be identified and is not currently available in eHMP.';
    var COSIGNER_REQUIRED_RESPONSE = '1';
    var rpcName = 'TIU REQUIRES COSIGNATURE';
    var signItems = _.get(writebackContext, 'model.signItems', _.get(writebackContext, 'model.signedAddendums'));
    var refIds = [];

    if (!_.isEmpty(signItems)) {
        _.each(signItems, function(signItem) {
            refIds.push(_.last(_.get(signItem, 'documentDefUid', '0').split(':')));
        });

    } else {
        refIds.push(_.last(_.get(writebackContext, 'model.documentDefUid', '0').split(':')));
    }

    //call TIU REQUIRES COSIGNATURE for each of the document ref ids found in the writeback model
    async.each(refIds, function(documentRefId, callback) {
            rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
                if (err) {
                    return callback(err);
                }
                var rpcParams = [];

                //not title uid for save requests
                rpcParams.push(documentRefId);

                //note title uid for sign requests, we always save before signing in our workflow
                rpcParams.push('');

                //user dfn
                rpcParams.push(writebackContext.duz[writebackContext.siteHash]);

                //today's date
                rpcParams.push(fmDateUtil.getFilemanDateTime(new Date()));

                rpcClient.execute(
                    rpcName,
                    rpcParams,
                    function(err, response) {
                        if (err || response === COSIGNER_REQUIRED_RESPONSE) {
                            return callback(ERROR_RESPONSE);
                        } else {
                            return callback();
                        }
                    }
                );

            });
        },
        function(err) {
            if (err) {
                return setImmediate(callback, ERROR_RESPONSE);
            } else {
                return setImmediate(callback, null);
            }
        });
};


module.exports.unsigned = function(writebackContext, callback) {
    var titleId = writebackContext.model.documentDefUid;
    var error = null;
    var logger = writebackContext.logger;
    // Add PID, author, status, and siteHash to the model
    writebackContext.model.pid = writebackContext.interceptorResults.patientIdentifiers.dfn;
    writebackContext.model.siteHash = writebackContext.interceptorResults.patientIdentifiers.site;
    if (!writebackContext.model.authorUid) {
        writebackContext.model.authorUid = writebackContext.duz[writebackContext.siteHash];
    }
    logger.debug('writeback.model.authorUid: %s', writebackContext.model.authorUid);
    writebackContext.model.status = 'UNSIGNED';

    if (!titleId) {
        error = 'documentDefUid is missing from the model. A title is needed to save a note.';
    } else if (!writebackContext.model.authorUid) {
        error = 'The user could not be determined from the session. Review log.';
        logger.error({
            duz: writebackContext.duz,
            site: writebackContext.siteHash
        }, 'Failed to get user\'s duz by siteHash.');
    }

    if (error) {
        return setImmediate(callback, error);
    }

    return setImmediate(callback, null);
};

module.exports.createAddendum = function(writebackContext, callback) {
    var titleId = writebackContext.model.documentDefUid;
    var error = '';
    var logger = writebackContext.logger;
    var model = writebackContext.model;

    model.pid = writebackContext.interceptorResults.patientIdentifiers.dfn;
    model.siteHash = writebackContext.interceptorResults.patientIdentifiers.site;

    if (!model.authorUid) {
        model.authorUid = writebackContext.duz[writebackContext.siteHash];
    }
    logger.debug('writeback.model.authorUid: %s', model.authorUid);
    model.noteType = 'ADDENDUM';
    model.status = 'UNSIGNED';

    if (!titleId) {
        error = 'documentDefUid is missing from the model. ';
    }
    if (!model.parentUid) {
        error = error + 'parentUid is missing from the model. ';
    }
    if (!model.authorUid) {
        error = 'The user could not be determined from the session. Review log.';
        logger.error({
            duz: writebackContext.duz,
            site: writebackContext.siteHash
        }, 'Failed to get user\'s duz by siteHash.');
    }

    if (error) {
        return setImmediate(callback, error);
    }

    return runCreateAddendumASU(writebackContext, callback);
};

module.exports.update = function(writebackContext, callback) {
    var pid = writebackContext.interceptorResults.patientIdentifiers.siteDfn;
    var ien = writebackContext.resourceId;
    var error = null;

    if (!pid || !ien) {
        error = 'The note\'s IEN and patient\'s PID are needed to update a note.';
        return setImmediate(callback, error);
    }

    // Set the model's attributes using the endpoint and session.
    writebackContext.model.pid = writebackContext.interceptorResults.patientIdentifiers.dfn;
    writebackContext.model.siteHash = writebackContext.interceptorResults.patientIdentifiers.site;

    //Remove 'localId', 'authorUid', 'siteHash', and 'pid' from model so that they aren't overwritten.
    addUid(writebackContext);
    writebackContext.model.localId = ien;
    return setImmediate(callback, error);
};

module.exports.delete = function(writebackContext, callback) {
    addUid(writebackContext);
    var error = null;
    return setImmediate(callback, error);
};

module.exports.sign = function(writebackContext, callback) {

    var error = null;
    if (!writebackContext.model.signatureCode) {
        return setImmediate(callback, 'signatureCode is missing from the model. A signature code is required to sign a note.');
    }
    writebackContext.model.signatureCode = encryptor.encryptSig(writebackContext.model.signatureCode);
    writebackContext.model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;

    var uid = writebackContext.model.signItems[0].uid;
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;

    clinicalObjSubsystem.read(logger, appConfig, uid, false, function(err, response) {
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the JDS notes read endpoint');

            logger.warn('Failed to read the note from JDS.');
            return setImmediate(callback, err);
        }
        var errors = [];
        var model = clinicalObjUtil.returnClinicialObjectData(errors, [response])[0];
        if (!_.isEmpty(errors) || !model) {
            return setImmediate(callback, errors);
        }
        if (model.signLock || _.get(model, 'clinicalObject.ehmpState') === 'active') {
            return setImmediate(callback, 'You are unable to sign this note because you signed it on another computer. Contact your System Administrator for assistance or refresh the application and locate this note under the My Signed Notes section.');
        }
        return setImmediate(callback, error);
    });
};

module.exports.signAddendum = function(writebackContext, callback) {

    var error = null;
    if (!writebackContext.model.signatureCode) {
        return setImmediate(callback, 'signatureCode is missing from the model. A signature code is required to sign a addendum.');
    }
    writebackContext.model.signatureCode = encryptor.encryptSig(writebackContext.model.signatureCode);
    writebackContext.model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    return setImmediate(callback, error);
};

module.exports.runDeleteRecordASU = function(writebackContext, callback) {
    var logger = writebackContext.logger;

    var doc = writebackContext.model;
    var currentUserUid = 'urn:va:user:' + writebackContext.siteHash + ':' + writebackContext.duz[writebackContext.siteHash];
    var docAuthor = doc.authorUid;
    logger.info({
        currentUser: currentUserUid,
        docAuthor: docAuthor
    });
    if (currentUserUid === docAuthor && doc.status === 'UNSIGNED') {
        logger.info('AUTHORIZED - User is the author. Allow DELETE RECORD of UNSIGNED document with business rule.');
        return setImmediate(callback, null);
    }

    var request = {};
    request.logger = writebackContext.logger;
    request.app = {
        config: writebackContext.appConfig
    };
    request.audit = writebackContext.audit;

    var asuItem = {
        data: {
            items: [doc]
        },
        actionNames: ['DELETE RECORD'],
        userdetails: {
            site: writebackContext.siteHash,
            duz: writebackContext.duz,
            vistaUserClass: writebackContext.vistaUserClass
        }
    };
    logger.info({
        asuRequest: asuItem
    });
    asu.getAsuPermissionForActionNames(request, asuItem, function(asuError, asuResult) {
        var item = asuItem.data.items[0];

        if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
            logger.error({
                item: item.localTitle,
                error: asuError,
                result: asuResult
            });
            return setImmediate(callback, 'ASU permission check failed: ' + asuError);
        }
        logger.debug({
            item: item.localTitle,
            result: asuResult
        });
        var denied = _.chain(asuResult)
            .filter(function(perm) {
                return perm.hasPermission === false;
            })
            .map(function(perm) {
                return perm.actionName;
            })
            .value();

        if (denied.length === 0) {
            logger.info('AUTHORIZED - User has the required permissions for this resource.');
            return setImmediate(callback, null);
        } else {
            var msg = 'UNAUTHORIZED - User lacks ASU permission to delete this record.';
            logger.info(msg);
            return setImmediate(callback, {
                message: msg
            });
        }
    });
};

var runCreateAddendumASU = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var parentNote;


    var jdsPath = '/vpr/uid/' + writebackContext.model.parentUid;
    var requestConfig = _.extend({}, appConfig.jdsServer, {
        logger: logger,
        url: jdsPath,
        json: true
    });
    httpUtil.get(requestConfig, function(error, response, body) {
        if (error) {
            logger.error({
                err: error
            }, 'Failed to retrieve parent note.');
            return setImmediate(callback, 'Failed to retrieve parent note. Error:' + error);
        }
        var errorMessages = [];
        var errors = _.get(body, 'error.errors', []);
        if (!_.isEmpty(errors)) {
            _.each(errors, function(errorObj) {
                errorMessages.push(errorObj.domain + ':' + errorObj.message);
            });
            return setImmediate(callback, 'Failed to retrieve parent note. JDS errors:' + errorMessages);
        }
        var jdsUidExists = _.isObject(_.get(body, 'data.items[0]'));
        if (!jdsUidExists) {
            return setImmediate(callback, 'Failed to retrieve parent note.');
        }
        parentNote = body.data.items[0];
        logger.info('createAddendum parentNote:', parentNote);
        writebackContext.referenceId = parentNote.uid;

        var request = {};
        request.logger = writebackContext.logger;
        request.app = {
            config: writebackContext.appConfig
        };
        request.audit = writebackContext.audit;

        var asuItem = {
            data: {
                items: [parentNote]
            },
            actionNames: ['MAKE ADDENDUM'],
            userdetails: {
                site: writebackContext.siteHash,
                duz: writebackContext.duz,
                vistaUserClass: writebackContext.vistaUserClass
            }
        };
        logger.info('createAddendum asu request:', asuItem);
        asu.getAsuPermissionForActionNames(request, asuItem, function(asuError, asuResult) {
            var item = asuItem.data.items[0];

            if (!nullchecker.isNullish(asuError) || _.isNull(asuResult)) {
                logger.error('Failed to check ASU for item %j: Error %j .asuResult %j', item.localTitle, asuError, asuResult);
                return setImmediate(callback, 'ASU failed on parent note:' + asuError);
            }
            logger.debug('Displaying result for item %j ASU result: %j', item.localTitle, asuResult);

            var denied = _.chain(asuResult)
                .filter(function(perm) {
                    return perm.hasPermission === false;
                })
                .map(function(perm) {
                    return perm.actionName;
                })
                .value();

            if (denied.length === 0) {
                logger.info('AUTHORIZED - User has the required permissions for this resource.');
                return setImmediate(callback, null);
            } else {
                var msg = 'UNAUTHORIZED - User lacks ASU permission to create an addendum for this note.';
                logger.info(msg);
                return setImmediate(callback, {
                    message: msg
                });
            }
        });
    });
};
var addUid = function(writebackContext) {
    writebackContext.model.uid = writebackContext.resourceId;
};
