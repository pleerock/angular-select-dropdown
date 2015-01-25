/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name selectDropdownItemsBox
     * @restrict E
     * @description
     * This directive shows all items in the list separated by comma.
     *
     * @param {Function} decorator Decorator function that can wrap or change how item will be shown in the items box
     * @param {string} nothingSelectedLabel Decorator function that can wrap or change how item will be shown in the items box
     * @param {string} separator Separator character used between items
     * @param {number} showLimit Maximal number of items to be shown in the box
     */
    angular.module('selectDropdown').directive('selectDropdownItemsBox', selectDropdownItemsBox);

    /**
     * @ngInject
     */
    function selectDropdownItemsBox(selectDropdownConfiguration) {
        return {
            scope: {
                decorator: '='
            },
            restrict: 'E',
            require: ['^ngModel', '^selectOptions'],
            template: '<div class="arrow-container"><div class="arrow"></div></div><div class="text-items">' +
                '<span ng-repeat="item in getItems()">' +
                    '<span class="items-item" ng-hide="showLimit && $index >= showLimit" ng-bind-html="getItemName(item)"></span>' +
                    '<span class="items-separator" ng-hide="$last || (showLimit && $index >= showLimit)">{{ separator }}</span>' +
                    '<span class="items-limit" ng-show="showLimit && $index === showLimit">...</span>' +
                '</span>' +
                '<div ng-show="!getItems() || !getItems().length">{{ nothingSelectedLabel }}</div>' +
            '</div>',
            link: function (scope, element, attrs, controllers) {

                var ngModelCtrl         = controllers[0];
                var selectOptionsCtrl   = controllers[1];

                scope.nothingSelectedLabel = attrs.nothingSelectedLabel ? attrs.nothingSelectedLabel : selectDropdownConfiguration.nothingSelectedLabel;
                scope.separator            = attrs.separator ? attrs.separator : selectDropdownConfiguration.separator;
                scope.showLimit            = attrs.showLimit ? parseInt(attrs.showLimit) : null;

                /**
                 * Gets the item name that will be used to display in the list.
                 *
                 * @param {Object} item
                 * @returns {string}
                 */
                scope.getItemName = function(item) {
                    var value = selectOptionsCtrl.parseItemValueFromSelection(item);
                    return scope.decorator ? scope.decorator(item) : value;
                };

                /**
                 * Gets the items that will be used as an options for the model.
                 *
                 * @returns {Object[]}
                 */
                scope.getItems = function() {
                    var items = ngModelCtrl.$viewValue;
                    if (items && !angular.isArray(items))
                        return [items];

                    return items;
                };
            }
        };
    }

})();