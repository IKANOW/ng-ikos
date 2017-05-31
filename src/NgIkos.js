/* global angular, require */

/**
 * @typedef {String} ObjectId
 */

/**
 * @typedef {String} JsonString
 */

/**
 * @typedef {Object} ObjectWithId
 * @property {String} _id
 */

/**
 * @typedef {Object<?>} Promise
 */

/**
 * @typedef {Number} UnixTimestamp
 */

/**
 * @typedef {Object} HarvestConfig
 */

/**
 * Response Object from the IKOS REST API
 * @typedef {Object} IKOSApiResponse
 * @property {IKOSResponseMeta} response
 * @property {Array<Object>|Object} data
 */

/**
 * @typedef {Object} IKOSResponseMeta
 * @property {Number} code HTTP Response code
 * @property {Number} time Response time in seconds
 * @property {String} error Error message
 * @property {String} errorCode Error code from app internals
 *
 */

/**
 * @typedef {ObjectWithId} Group
 * @property {Array<GroupMember>} members
 */

/**
 * @typedef {Object} GroupMember
 * @property {ObjectId} _id
 * @property {String} displayName
 *
 */

//noinspection JSUnresolvedFunction
/**
 *
 * @ngdoc service
 * @name wng-ikos.service:NgIkos
 * @description Base API HTTP Wrapper.
 *
 * ###Additional information
 * NgIkos handles the IKOS platform API response format to parse successful data and error messages.
 */
angular.module('ng-ikos', []).provider('NgIkos', function() {
  'use strict';

  // Defaults to "/"
  var apiBase;

  /**
   * Set the API Base url, suffix with trailing / required.
   * @param {String} newBaseUrl
   */
  this.setBaseUrl = function(newBaseUrl){ apiBase = newBaseUrl; };
  this.setBaseUrl('/');

  // ********************************************************************* //
  // Main public API methods
  // ********************************************************************* //
  // For provider, we provide the $get instead of returning the object.
  this.$get = [ '$q', '$http', '$log',  function($q, $http, $log) {

    var NgIkos = {};

    /**
     * @name _getApiBase
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Shorthand to get API Base from NgIkosProvider
     * @private
     */
    NgIkos.getApiBase = function(){ return apiBase; };

    /**
     * @ngdoc method
     * @name hashPassword
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Hash passwords for API use using SHA256 and formatted in base 64
     * @param {String} plainPassword Plain text password to hash
     * @returns {String} SHA256 base64 hashed password.
     */
    NgIkos.hashPassword = function(plainPassword){
      var hashes = require('hashes');
      var SHA256 = new hashes.SHA256();
      return SHA256.b64(plainPassword);
    };

    /**
     * Error check and return the data portion of an api response. Useful for promise chains.
     *
     * eg.
     *
     * return SourceApiService.getAll().then( NgIkos.resolveWithData );
     *
     * IF data does not exist a rejection with be issued.
     *
     * @param apiResponse
     * @returns {Promise<Array>}
     */
    NgIkos.resolveWithData = function(apiResponse){
      if(_.isEmpty(apiResponse)) return $q.reject('Api Response is empty, cannot read data.');
      if(!apiResponse.hasOwnProperty('data')) return $q.reject('Api Response does not contain a data object.');
      return apiResponse.data;
    };

    NgIkos.resolveWithDataId = function(apiResponse){
      if(_.isEmpty(apiResponse)) return $q.reject('Api Response is empty, cannot read data.');
      if(!apiResponse.hasOwnProperty('data')) return $q.reject('Api Response does not contain a data object.');
      if(!apiResponse.data.hasOwnProperty('_id')) return $q.reject('Data object does not contain an ID.');
      return apiResponse.data._id;
    };

    NgIkos.resolveWithDataOrArray = function(apiResponse){
      if(_.isEmpty(apiResponse)) return $q.reject('Api Response is empty, cannot parse.');
      if(!apiResponse.hasOwnProperty('data')) return [];
      return apiResponse.data;
    };

    NgIkos.resolveWithDataOrObject = function(apiResponse){
      if(_.isEmpty(apiResponse)) return $q.reject('Api Response is empty, cannot parse.');
      if(!apiResponse.hasOwnProperty('data')) return {};
      return apiResponse.data;
    };

    /**
     *
     * @param apiResponse
     * @returns {Promise<IKOSResponseMeta>} Response portion of ApiResponse
     */
    NgIkos.resolveWithResponseMeta = function(apiResponse){
      if(_.isEmpty(apiResponse)) return $q.reject('Api Response is empty, cannot read "response".');
      return apiResponse.response;
    };

    /**
     * Base query function, returns promise.
     * Promise resolves to data object if successful
     * on failure, Promise rejects with an error message
     * @param {String} method                 HTTP Method
     * @param {String} apiEndpoint            Api endpoint URI
     * @param {Object} [queryParams=null]     Query String data
     * @param {Object} [postData=null]        HTTP Post data
     * @param {Boolean} [alwaysResolve=false] Set to true to skip the {httpResponse.data.response.success} check.
     * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
     * @returns {Promise<IKOSApiResponse>} HTTP Promise
     */
    NgIkos.raw = function( method, apiEndpoint, queryParams, postData, alwaysResolve, forceContentType ) {

      //Deferred
      var def = $q.defer();

      //Build a request using defaults and applying httpRequestConfig
      var httpReq = {
        method:_.indexOf(['GET', 'POST', 'PUT', 'DELETE'], (method + '').toUpperCase() ) > -1 ? method : 'GET',
        url: apiBase + apiEndpoint
      };

      //Apply postData AND query string params
      //some POST/PUT/DELETE calls may need both.
      if (angular.isDefined(queryParams)) httpReq.params = queryParams;
      if (angular.isDefined(postData)) httpReq.data = postData;

      //Apply contentType if provided
      if (forceContentType && httpReq.method !== 'GET') {
        httpReq.headers = {
          //undefined lets the browser automatically decide how to set content-type
          'Content-Type': forceContentType === 'undefined' ? undefined : forceContentType
        };
      }

      //Debugging
      $log.debug('[NgIkos->raw] HTTP Request:', httpReq );

      //Start HTTP process
      $http(httpReq).then(
        function apiSuccess(httpResponse){
          if( !_.has(httpResponse.data,'error') || alwaysResolve === true ){
            def.resolve(httpResponse.data);
          } else {
            //HTTP may be successful but we the return object may indicate a failure
            def.reject(httpResponse.data.error.message || 'No message from API.');
          }
        },
        function apiError(error){
          //Reject with the error provided from $http
          def.reject(error);
        }
      );

      //Return promise
      return def.promise;
    };


    /* *****
     * Convenience HTTP methods
     * Note the order swap on queryParans and postData for the POST,PUT,DELETE methods.
     * These are re-arranged to fit most common use. the raw method prioritizes the queryParams.
     * ****/


    /**
     * @ngdoc method
     * @name get
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Perform an HTTP GET request on the IKOS Platform API
     *
     * @param {String} apiEndpoint IKOS API endpoint URL
     * @param {Object} [queryParams=null] Data to submit via http query string parameters
     * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
     * @returns {Promise<IKOSApiResponse>} Api response promise after ( optional ) success check.
     */
    NgIkos.get = function( apiEndpoint, queryParams, alwaysResolve ){
      return NgIkos.raw('GET', apiEndpoint, queryParams, null, alwaysResolve);
    };

    /**
     * @ngdoc method
     * @name post
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Perform an HTTP POST request on the IKOS Platform API
     *
     * @param {String} apiEndpoint IKOS API endpoint URL
     * @param {Object} [postData=null] Data to submit via POST body. Objects will be JSON encoded automatically.
     * @param {Object} [queryParams=null] Data to submit via http query string parameters
     * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
     * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
     * @returns {Promise<IKOSApiResponse>} Api response promise after ( optional ) success check.
     */
    NgIkos.post = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
      return NgIkos.raw('POST', apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    };

    /**
     * @ngdoc method
     * @name put
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Perform an HTTP PUT request on the IKOS Platform API
     *
     * @param {String} apiEndpoint IKOS API endpoint URL
     * @param {Object} [postData=null] Data to submit via PUT body. Objects will be JSON encoded automatically.
     * @param {Object} [queryParams=null] Data to submit via http query string parameters
     * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
     * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
     * @returns {Promise<IKOSApiResponse>} Api response promise after ( optional ) success check.
     *
     * @example
     */
    NgIkos.put = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
      return NgIkos.raw('PUT', apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    };

    /**
     * @ngdoc method
     * @name delete
     * @methodOf ng-ikos.service:NgIkos
     * @description
     * Perform an HTTP DELETE request on the IKOS Platform API
     * @param {String} apiEndpoint IKOS API endpoint URL
     * @param {Object} [postData=null] Data to submit via DELETE body. Objects will be JSON encoded automatically.
     * @param {Object} [queryParams=null] Data to submit via http query string parameters
     * @param {Boolean} [alwaysResolve=false] Set to true to skip ApiResponse.response.success check
     * @param {String} [forceContentType=browser default]  Force the HTTP Content type header
     * @returns {Promise<IKOSApiResponse>} Api response promise after ( optional ) success check.
     */
    NgIkos.delete = function( apiEndpoint, postData, queryParams, alwaysResolve, forceContentType){
      return NgIkos.raw('DELETE', apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
    };

    return NgIkos;
  }];

});