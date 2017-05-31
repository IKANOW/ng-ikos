/*global angular*/

/**
 * @ngdoc service
 * @name infinite.service:AuthApiService
 * @description Authentication API Services
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module('ng-ikos').factory('AuthApiService', [ '$q', 'NgIkos',
  function($q, NgIkos) {
    'use strict';

    var AuthApiService = {};

    /**
     * Get base URI for this resource
     * @returns {string}
     */
    AuthApiService.getBaseUri = function(){ return 'auth/'; };

    /**
     * @ngdoc method
     * @name raw
     * @methodOf  ng-ikos.service:AuthApiService
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
    AuthApiService.raw = function(method, endpointUri, queryParams, postData, alwaysResolve, forceContentType){
      return NgIkos.raw( method, AuthApiService.getBaseUri() + endpointUri, queryParams, postData, alwaysResolve, forceContentType );
    };

    /**
     * @ngdoc method
     * @name keepAlive
     * @methodOf ng-ikos.service:AuthApiService
     * @description
     *
     * @returns {Promise<IKOSApiResponse>} ApiResponse on success.
     */
    AuthApiService.keepAlive = function(){
      return AuthApiService.raw('PUT');
    };

    /**
     * @ngdoc method
     * @name login
     * @methodOf ng-ikos.service:AuthApiService
     * @description
     *
     * @param {String} username Email or username
     * @param {String} password User's password in cleartext. Password will be hashed.
     * @param {Boolean} [returnTempKey=false] Set to true to get a temporary api token
     * @param {Boolean} [override=false] Set to true to log out all other sessions
     * @param {String} [returnUrl=null] Optionally set the url to return to if using post / redirect flow.
     * @param {Boolean} [multiLogin=false] Set to true then multiple logins are allowed ( admin only )
     * @returns {Promise<IKOSApiResponse>} ApiResponse on success.
     */
    AuthApiService.login = function(username, password, returnTempKey, override, returnUrl, multiLogin ){
      var options = {
        username: username,
        password: NgIkos.hashPassword(password)
      };
      if (returnTempKey === true) {
        options.return_tmp_key = true;
      }
      if (override === false) {
        options.override = false;
      }
      if (returnUrl) {
        options.returnurl = returnUrl;
      }
      if (multiLogin === true) {
        options.multi = true;
      }

      return AuthApiService.raw('POST', '', null, options);
    };

    /**
     * @ngdoc method
     * @name logout
     * @methodOf ng-ikos.service:AuthApiService
     * @description
     *
     * @returns {Promise<IKOSApiResponse>} ApiResponse on success.
     */
    AuthApiService.logout = function(){
      return AuthApiService.raw('DELETE');
    };

    return AuthApiService;
  }
]);