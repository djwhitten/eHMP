define([
    'underscore',
    'backbone',
    'handlebars',
    'app/applets/ordersearch/tray/groupView',
    'app/applets/ordersearch/tray/clinicalObjectUtil',
    'app/applets/orders/tray/consults/orderEntryUtils',
    'app/applets/orders/tray/labs/trayUtils'
], function(_, Backbone, Handlebars, GroupView, ClinicalObjectUtil, OrderEntryUtils, LabOrderTrayUtils) {
    'use strict';

    /**
     * Maps orderables through their type, domain, subDomain attributes (e.g. orderableIconMap[type][domain][subDomain])
     */
    var orderableIconMap = {
        // type
        'vista-orderable': {
            // domain
            'ehmp-order': {
                // subDomain
                'laboratory': 'fa-flask'
            }
        },
        // type
        'ehmp-enterprise-orderable': {
            // domain
            'ehmp-activity': {
                // subDomain
                'consult': 'fa-user-md'
            }
        }
        // Add new icon-type mappings when new orderable types are added.
    };

    function getOrderableIcon(item) {
        // set the icons according to orderable type (e.g. lab, consult, etc.)
        return _.get(orderableIconMap, [item.type, item.domain, item.subDomain]);
    }

    var OrderSearchResultModel = Backbone.Model.extend({
        parse: function(item) {
            item.icon = getOrderableIcon(item); // set icon to show for this orderable
            return item;
        }
    });

    var OrderSearchCollection = Backbone.Collection.extend({
        parse: function(response, options) {
            var results = [];

            var permissions = new ADK.UIResources.Fetch.Permission.Collection();
            var addConsults = permissions.hasOrderPermissions('add-consult-order');
            var addLabs = permissions.hasLabPermissions('add-lab-order');
            var addRequests = permissions.hasRequestPermissions('add-coordination-request');

            if (!addConsults && !addLabs && !addRequests) {
                return results;
            }

            if (!_.isEmpty(response.data)) {
                var data = _.get(response, 'data');
                var hasPermission = [];
                _.each(data, function (item) {
                    var subDomain = item.subDomain;
                    if (!addConsults && subDomain === 'consult') {
                        return;
                    }
                    if (!addLabs && subDomain === 'laboratory') {
                        return;
                    }

                    if (!addRequests && subDomain === 'request') {
                        return;
                    }

                    hasPermission.push(item);
                });

                if (hasPermission.length) {
                    results.push({
                        name: 'Orders',
                        items: new Backbone.Collection(hasPermission, {
                            model: OrderSearchResultModel,
                            parse: true
                        })
                    });
                }

            }
            return results;
        }
    });

    var View = GroupView.extend({
        initialize: function(options) {
            this.searchCriteriaModel = options.searchCriteriaModel;

            var permissions = new ADK.UIResources.Fetch.Permission.Collection();
            var addConsults = permissions.hasOrderPermissions('add-consult-order');
            var addLabs = permissions.hasLabPermissions('add-lab-order');
            var addRequests = permissions.hasRequestPermissions('add-coordination-request');

            if (!addConsults && !addLabs && !addRequests) {
                return;
            }

            this.listenTo(this.searchCriteriaModel, 'change:criteria', function() {
                this.search(this.searchCriteriaModel.get('criteria'));
            });

            this.collection = new OrderSearchCollection();

            this.listenTo(this.collection, 'fetch:success', function(collection) {
                this.loading(false);
            });

            this.listenTo(this.collection, 'fetch:error', function(collection) {
                this.loading(false);
            });

            //Collection fetchOptions
            this.fetchOptions = {
                pageable: false,
                resourceTitle: 'orderables',
                cache: false
            };
            this.search(this.searchCriteriaModel.get('criteria'));
        },
        options: {
            onClick: function(model) {
                var subDomain = model.get('subDomain');

                switch (subDomain) {
                    case 'consult':
                        OrderEntryUtils.launchOrderEntryForm({
                            cdsModel: ClinicalObjectUtil.consultToClinicalObject(model)
                        });
                        break;
                    case 'laboratory':
                        LabOrderTrayUtils.launchContextLabOrderForm({
                            cdsModel: ClinicalObjectUtil.labOrderableToClinicalObject(model)
                        });
                        break;

                    default:
                        return;
                }
            },
            attributeMapping: {
                groupLabel: 'name',
                groupItems: 'items',
                itemUniqueId: 'uid',
                itemLabel: 'name'
            },

            showFavoriteIcon: false,
            emptyGroupLabel: 'There are no orders matching your criteria.',
            loadingLabel: 'Searching orders...'
        },
        search: function(searchCriteria) {
            this.fetchOptions.criteria = searchCriteria ? {
                searchString: searchCriteria
            } : null;
            this.collection = ADK.ResourceService.fetchCollection(this.fetchOptions, this.collection);
            this.loading(true);
        }
    });
    return View;
});
