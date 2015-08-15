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
    function selectDropdownItemsBox(selectDropdownConfiguration, orderByFilter, filterFilter) {
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
                    var value = selectOptionsCtrl.parseItemName(item);
                    value = String(value).replace(/<[^>]+>/gm, ''); // strip html from the data here
                    return scope.decorator ? scope.decorator(item) : value;
                };

                scope.getItems = function() {
                    var items = selectOptionsCtrl.parseItems() || [];
                    if (selectOptionsCtrl.getOrderBy())
                        items = orderByFilter(items, selectOptionsCtrl.getOrderBy());
                    if (selectOptionsCtrl.getGroupBy())
                        items = orderByFilter(items, selectOptionsCtrl.getGroupByWithoutPrefixes());

                    var filteredItems = [];
                    angular.forEach(items, function(item) {
                        if (scope.isItemSelected(item)) {
                            filteredItems.push(item);
                        }
                    });
                    return filteredItems;
                };

                /**
                 * Checks if given item is selected.
                 *
                 * @param {object} item
                 * @returns {boolean}
                 */
                scope.isItemSelected = function(item) {
                    var model = ngModelCtrl.$modelValue;
                    var isMultiselect = model && model.length ? true : false;
                    if (!model && !isMultiselect) return false;
                    var value = selectOptionsCtrl.parseItemValue(item);
                    var trackByProperty = selectOptionsCtrl.getTrackBy();
                    var trackByValue    = selectOptionsCtrl.parseTrackBy(item);

                    // if no tracking specified simple compare object in the model
                    if (!trackByProperty || !trackByValue)
                        return isMultiselect  ? (model && model.indexOf(value) !== -1) : model === value;

                    // if tracking is specified then searching is more complex
                    if (isMultiselect) {
                        var isFound = false;
                        angular.forEach(model, function(m) {
                            if (m[trackByProperty] === trackByValue)
                                isFound = true;
                        });
                        return isFound;
                    }

                    return model[trackByProperty] === trackByValue;
                };
            }
        };
    }

})();