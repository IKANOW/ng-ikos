/*global angular*/
/**
 * @typedef {Group} DataGroup
 */

/**
 * @ngdoc service
 * @name infinite.social.service:DataGroupApiService
 * @description
 * Data group API End points
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module('ng-ikos').factory('DataGroupApiService', [ 'GroupApiService',
  function(GroupApiService) {
    'use strict';
    return new GroupApiService('data');
  }
]);