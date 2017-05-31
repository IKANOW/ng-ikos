/**
 * @typedef {Object} ProfileDef
 * @property {String} _id
 * @property {String} WPUserID
 * @property {String} accountStatus
 * @property {String} accountType
 * @property {Array<Group>} communities
 * @property {String} created
 * @property {String} displayName
 * @property {String} email
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} modified
 * @property {String} phone
 */

/**
 * @ngdoc service
 * @name infinite.social.service:PersonApiService
 * @description
 * User Endpoints
 */
angular.module('ng-ikos').factory('PersonApiService', [ 'NgIkos',
  function(NgIkos) {
    'use strict';
    var PersonApiService = {};

    /**
     * Get base URI for this resource
     * @returns {string}
     */
    PersonApiService.getBaseUri = function(){
      return 'user/';
    };

    /**
     * @ngdoc method
     * @name raw
     * @methodOf  ng-ikos.social.service:PersonApiService
     * @description
     * Raw access to the query mechanism for this API base path
     *
     * @param {'GET'|'POST'|'PUT'|'DELETE'} method HTTP Method
     * @param {String}  endpointUri End point relative to this base
     * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
     * @param {map}     [postData=null] Optional object to post as json
     * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
     * @param {String}  [forceContentType=null] Data mime-type if provided
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse if successful
     */
    PersonApiService.raw = function(method, endpointUri, queryParams, postData, alwaysResolve, forceContentType){
      return NgIkos.raw( method, PersonApiService.getBaseUri() + endpointUri, queryParams, postData, alwaysResolve, forceContentType );
    };


    /**
     * @ngdoc method
     * @name get
     * @methodOf infinite.social.service:PersonApiService
     * @description
     *
     * @param {ObjectId} [personId=null] Get a user by ID or use null to get current user.
     * @param {Boolean} [alwaysResolve=false] If true, this promise will always resolve.
     * @returns {Promise<IKOSApiResponse>} ApiResponse on success.
     */
    PersonApiService.get = function(personId, alwaysResolve){
      return PersonApiService.raw('GET', personId, null, null, alwaysResolve);
    };

    return PersonApiService;
  }
]);