'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var _ = require('underscore');

var log = require(global.VX_DUMMIES + 'dummy-logger');

var handler = require(global.VX_HANDLERS + 'osync/appointments/appointments');

var Router = require(global.VX_DUMMIES + 'publisherRouterDummy');
var Publisher = require(global.VX_DUMMIES + 'publisherDummy');
var Updater = require(global.VX_DUMMIES + 'JobStatusUpdaterDummy');

var wConfig = require(global.VX_ROOT + 'worker-config');

var mockConfig = {
    delay: 5,
    rpcContext: 'HMP SYNCHRONIZATION CONTEXT',
    vistaSites: _.defaults(wConfig.vistaSites, {
        '9E7A': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'C877': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    }),
    'appointmentsOptions': {
        'daysInFuture': 1
    }
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('appointments-handler integration test', function() {
    beforeEach(function() {
        spyOn(mockHandlerCallback, 'callback');
    });

    it('has the correct job values', function() {
        var done = false;
        var testData = null;
        var testError = null;

        runs(function() {
            var job = {type: 'appointments', siteId: '9E7A', clinic: '123'};

            var mockEnvironment = {};
            var mockPublisher = new Publisher(log, mockConfig, job.type);
            var mockRouter = new Router(log, mockConfig, Updater, mockPublisher);
            mockEnvironment.publisherRouter = mockRouter;
            handler(log, mockConfig, mockEnvironment, job, function(error, data) {
                done = true;
                testData = data;
                testError = error;
                mockHandlerCallback.callback();
            });
        });

        waitsFor(function() {
            return done;
        }, 'Callback not called', 50000);

        runs(function() {
            expect(mockHandlerCallback.callback).toHaveBeenCalled();
            expect(testError).toBe(undefined);
        });
    });
});
