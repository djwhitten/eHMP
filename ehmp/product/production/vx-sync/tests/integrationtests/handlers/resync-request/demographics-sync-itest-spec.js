'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var request = require('request');
var getDemographics = require(global.VX_HANDLERS + 'resync-request/get-patient-demographics');
var demographicsSync = require(global.VX_HANDLERS + 'resync-request/demographics-sync');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');

// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// dummyLogger = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var wConfig = require(global.VX_ROOT + 'worker-config');

var host = require(global.VX_INTTESTS + 'test-config');

function clearTestPatient(config, patientIdentifierValue) {
    var completed = false;
    var actualError, actualResponse;

    runs(function() {
        var options = {
            url: config.protocol + '://' + config.host + ':' + config.port + config.patientUnsyncPath,
            method: 'POST',
            qs: {
                pid: patientIdentifierValue
            }
        };

        request.post(options, function(error, response) {
            actualError = error;
            actualResponse = response;
            completed = true;
        });
    });

    waitsFor(function() {
        return completed;
    }, 'Timed out waiting for patient to clear.', 20000);

    runs(function() {
        expect(actualError).toBeFalsy();
        expect(actualResponse).toBeTruthy();
    });
}

function retrieveSyncStatus(patientIdentifier, environment, callback) {
    environment.jds.getSyncStatus(patientIdentifier, function(error, response) {
        callback(error, response.statusCode);
    });
}

function retrieveEnterpriseSyncJobHistory(patientIdentifier, environment, callback) {
    var job = {
        patientIdentifier: patientIdentifier
    };

    var filter = {
        filter: '?filter=eq(\"type\",\"enterprise-sync-request\")'
    };

    environment.jds.getJobStatus(job, filter, function(error, response, result) {
        callback(error, response, result);
    });
}

describe('demographics-sync', function() {
    describe('When a demographics sync request is made', function() {
        var config, environment;

        beforeEach(function() {
            config = {
                retrySync: {
                    maxRetries: 3
                },
                syncRequestApi: {
                    protocol: 'http',
                    host: host,
                    port: 8080,
                    patientSyncPath: '/sync/doLoad',
                    patientUnsyncPath: '/sync/clearPatient',
                    patientStatusPath: '/sync/status',
                    patientSyncDemoPath: '/sync/demographicSync',
                    method: 'POST'
                },
                vistaSites: {
                    '9E7A': {},
                    'C877': {}
                },
                jds: _.defaults(wConfig.jds, {
                    protocol: 'http',
                    host: 'IP        ',
                    port: PORT
                })
            };

            environment = {
                metrics: dummyLogger,
                jds: new JdsClient(dummyLogger, dummyLogger, config)
            };

            clearTestPatient(config.syncRequestApi, '9E7A;3');
        });


        it('then the patient is synced', function() {
            var job = {
                type: 'resync-request',
                patientIdentifier: {
                    type: 'icn',
                    value: '10108V420871'
                },
                rootJobId: '1',
                jobId: '1',
                demographics: {
                    "birthDate": "19350407",
                    "displayName": "Eight,Patient",
                    "familyName": "EIGHT",
                    "fullName": "EIGHT,PATIENT",
                    "genderCode": "urn:va:pat-gender:M",
                    "genderName": "Male",
                    "givenNames": "PATIENT",
                    "icn": "10108V420871",
                    "last4": "0008",
                    "last5": "E0008",
                    "lastUpdateTime": 20160222155413,
                    "localId": "3",
                    "lrdfn": "27",
                    "maritalStatusCode": "urn:va:pat-maritalStatus:M",
                    "maritalStatusName": "Married",
                    "pid": "2939;19",
                    "ssn": "666000008",
                    "uid": "urn:va:patient:2939:19:19",
                    "veteran": true
                },
                referenceInfo: {
                    'sessionId': 'Test session',
                    'requestId': 'Test request'
                }
            };
            var completed = false;
            var actualError, actualSyncStatus;

            demographicsSync(dummyLogger, config.syncRequestApi, job, function(error) {
                actualError = error;
                retrieveSyncStatus(job.patientIdentifier, environment, function(error, syncStatus) {
                    actualError = error;
                    actualSyncStatus = syncStatus;
                    completed = true;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'response from demographics sync timed out.', 20000);

            var getJobComplete = false;

            runs(function() {
                expect(actualError).toBeFalsy();
                expect(actualSyncStatus).toBe(200);

                //Verify referenceInfo was passed into enterprise-sync-request
                retrieveEnterpriseSyncJobHistory(job.patientIdentifier, environment, function(error, response, result){
                    expect(error).toBeFalsy();
                    expect(response).toBeTruthy();
                    expect(response.message).toBeFalsy();
                    expect(val(result, ['items','0', 'referenceInfo'])).toEqual(jasmine.objectContaining({
                        'sessionId': 'Test session',
                        'requestId': 'Test request'
                    }));
                    getJobComplete = true;
                });
            });

            waitsFor(function() {
                return getJobComplete;
            }, 'waiting for enterprise sync job', 20000);

        });
    });
});