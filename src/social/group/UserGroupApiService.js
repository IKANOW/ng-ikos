/*global angular*/
/**
 * @typedef {Group} UserGroup
 */

/**
 * @ngdoc service
 * @name infinite.social.service:UserGroupApiService
 * @description
 * User group API End points
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module('ng-ikos').factory('UserGroupApiService', [ 'GroupApiService',
  function(GroupApiService) {
    'use strict';
    return new GroupApiService('user');
  }
]);