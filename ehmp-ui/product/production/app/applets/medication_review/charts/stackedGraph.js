define([
    'jquery',
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'app/applets/medication_review/medicationResourceHandler',
    'app/applets/medication_review/charts/chartBuilder',
    'app/applets/medication_review/charts/chartConfig',
    'app/applets/lab_results_grid/appletHelpers'
], function($, moment, Backbone, Marionette, _, MedsResource, ChartBuilder, GraphConfig, AppletHelper) {
    'use strict';

    ADK.Messaging.getChannel('meds_review').reply('chartInfo', function(params) {
        var outpatient;
        var buildChart;
        var medicationChartConfig;
        var stackedGraphModel;
        var stackedGraphObject;
        var medicationGroups = MedsResource.getMedicationGroup(params.collection, params.typeName.toLowerCase());

        var stacked = function(medicationGroupType, groupType) {
            var inpatientGroup, outpatientGroup, group;
            if (medicationGroups.inpatientMeds) {
                inpatientGroup = medicationGroups.inpatientMeds.get('subMedsInternalGroupModels');
            }
            if (medicationGroups.outpatientMeds) {
                outpatientGroup = medicationGroups.outpatientMeds.get('subMedsInternalGroupModels');
            }
            if (groupType === 'inpatientGroup') {
                group = inpatientGroup;
            } else if (groupType === 'outpatientGroup') {
                group = outpatientGroup;
            }
            stackedGraphObject = {};
            buildChart = new ChartBuilder(medicationGroupType, true);
            medicationChartConfig = new GraphConfig(buildChart);
            stackedGraphModel = new Backbone.Model({
                resultUnits: buildChart.instructions,
                observed: undefined,
                typeName: params.typeName.toUpperCase(),
                graphType: params.graphType,
                applet_id: 'medication_review',
                collection: params.collection,
                uid: buildChart.uid,
                subMedsInternalGroupModels: group,
                medicationGroupType: medicationGroupType,
                ChartBuilder: ChartBuilder,
                GraphConfig: GraphConfig
            });
            $.extend(true, stackedGraphObject, stackedGraphModel.attributes);
            stackedGraphObject.model = stackedGraphModel;
            stackedGraphObject.chart = medicationChartConfig;
            stackedGraphObject.requesterInstanceId = params.instanceId;
            ADK.Messaging.getChannel('stackedGraph').trigger('readyToChart', {
                response: stackedGraphObject,
                requestParams: params
            });
            return stackedGraphObject;
        };

        if (medicationGroups.outpatientMeds) {
            outpatient = medicationGroups.outpatientMeds;
            stacked(outpatient, 'outpatientGroup');
        }

        if (!medicationGroups.inpatientMeds && !medicationGroups.outpatientMeds) {
            stackedGraphObject = {};
            stackedGraphModel = new Backbone.Model({
                resultUnits: '--',
                observed: undefined,
                typeName: params.typeName.toUpperCase(),
                graphType: params.graphType,
                applet_id: 'medication_review',
                collection: params.collection,
                uid: null,
                noData: true
            });

            $.extend(true, stackedGraphObject, stackedGraphModel.attributes);
            stackedGraphObject.model = stackedGraphModel;
            stackedGraphObject.chart = AppletHelper.chartOptions;
            stackedGraphObject.requesterInstanceId = params.instanceId;
            ADK.Messaging.getChannel('stackedGraph').trigger('readyToChart', {
                response: stackedGraphObject,
                requestParams: params
            });
        }
    });
});
