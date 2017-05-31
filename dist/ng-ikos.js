(function (module) {

  /*******************************************************************************
   * Copyright 2016, The IKANOW Open Source Project.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   ******************************************************************************/

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

  // RequireJS include
  var angular = require('angular'),
      sprintf = require('sprintf'),
      _ = require('lodash');

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
  module.provider('NgIkos', function() {
    'use strict';

    // Defaults to "/"
    var apiBase;

    /**
     * Set the API Base url, suffix with trailing / required.
     * @param {String} newBaseUrl
     */
    this.setBaseUrl = function(newBaseUrl){ apiBase = newBaseUrl; };
    this.setBaseUrl("/");

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
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read data.");
        if(!apiResponse.hasOwnProperty('data')) return $q.reject("Api Response does not contain a data object.");
        return apiResponse.data;
      };

      NgIkos.resolveWithDataId = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read data.");
        if(!apiResponse.hasOwnProperty('data')) return $q.reject("Api Response does not contain a data object.");
        if(!apiResponse.data.hasOwnProperty('_id')) return $q.reject("Data object does not contain an ID.");
        return apiResponse.data._id;
      };

      NgIkos.resolveWithDataOrArray = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot parse.");
        if(!apiResponse.hasOwnProperty('data')) return [];
        return apiResponse.data;
      };

      NgIkos.resolveWithDataOrObject = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot parse.");
        if(!apiResponse.hasOwnProperty('data')) return {};
        return apiResponse.data;
      };

      /**
       *
       * @param apiResponse
       * @returns {Promise<IKOSResponseMeta>} Response portion of ApiResponse
       */
      NgIkos.resolveWithResponseMeta = function(apiResponse){
        if(_.isEmpty(apiResponse)) return $q.reject("Api Response is empty, cannot read 'response'.");
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
          method:_.indexOf(["GET", "POST", "PUT", "DELETE"], (method + "").toUpperCase() ) > -1 ? method : "GET",
          url: apiBase + apiEndpoint
        };

        //Apply postData AND query string params
        //some POST/PUT/DELETE calls may need both.
        if (angular.isDefined(queryParams)) httpReq.params = queryParams;
        if (angular.isDefined(postData)) httpReq.data = postData;

        //Apply contentType if provided
        if (forceContentType && httpReq.method != "GET") {
          httpReq.headers = {
            //undefined lets the browser automatically decide how to set content-type
            'Content-Type': forceContentType == 'undefined' ? undefined : forceContentType
          };
        }

        //Debugging
        $log.debug("[NgIkos->raw] HTTP Request:", httpReq );

        //Start HTTP process
        $http(httpReq).then(
          function apiSuccess(httpResponse){
            if( !_.has(httpResponse.data,'error') || alwaysResolve === true ){
              def.resolve(httpResponse.data);
            } else {
              //HTTP may be successful but we the return object may indicate a failure
              def.reject(httpResponse.data.error.message || "No message from API.");
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
        return NgIkos.raw("GET", apiEndpoint, queryParams, null, alwaysResolve);
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
        return NgIkos.raw("POST", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
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
        return NgIkos.raw("PUT", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
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
        return NgIkos.raw("DELETE", apiEndpoint, queryParams, postData, alwaysResolve, forceContentType);
      };

      return NgIkos;
    }];

  });
  /**
   * @ngdoc service
   * @name ng-ikos.service:CrudApiService
   * @description IKOS Bucket Services
   */
  module.factory('CrudApiService', [ '$q', 'NgIkos',

    function($q, NgIkos) {
      'use strict';

      /**
       * Compile server, read_write, and identifier into an escaped uri
       * @param {String} svc            IKOS CRUD 'service'
       * @param {"read"|"write"} rw     IKOS CRUD read/write flag
       * @param {String} id             IKOS 'service' identifier
       * @param {String} [suffix=null]  Optional trailing uri
       */
      function compileParts(svc, rw, id, suffix){
        return encodeURIComponent(svc) + "/" + encodeURIComponent(rw) + "/" + encodeURIComponent(id) + ((!!suffix) ? suffix : "");
      }

      var CrudApiService = {};

      /**
       * Get the base URI for Bucket Requests
       * @returns {string}
       */
      CrudApiService.getBaseUri = function(){ return "crud/"; };

      /**
       * @ngdoc method
       * @name rawQuery
       * @methodOf infinite.service:AuthApiService
       * @description
       * Raw access to the query mechanism for this API base path
       *
       * @param {"GET"|"POST"|"PUT"|"DELETE"} method HTTP Method
       * @param {String}  endpointUri End point relative to this base
       * @param {map}     [queryParams=null] Optional data to pass in the URL as http query parameters
       * @param {map}     [postData=null] Optional object to post as json
       * @param {Boolean} [alwaysResolve=false] Set to true to always resolve and never reject.
       * @param {String}  [forceContentType=null] Data mime-type if provided
       * @returns {Promise<IKOSApiResponse>} ApiResponse if successful
       */
      CrudApiService.raw = function(method, endpointUri, queryParams, postData, alwaysResolve, forceContentType){
        return NgIkos.raw( method, CrudApiService.getBaseUri() + endpointUri, queryParams, postData, alwaysResolve, forceContentType);
      };


      /**
       * Create a JSON Object in a bucket
       * @param svc
       * @param rw
       * @param id
       * @param buckets
       * @param jsonObject
       * @returns {Promise.<IKOSApiResponse>}
       */
      CrudApiService.createJsonObject = function(svc, rw, id, buckets, jsonObject){
        return CrudApiService.raw("POST", compileParts(svc, rw, id, "/object" ), { buckets: buckets }, jsonObject);
      };

      CrudApiService.createBucketFile = function(svc, rw, id, buckets, file){
        return CrudApiService.raw("POST", compileParts(svc, rw, id, "/file" ), { buckets: buckets }, file);
      };

      CrudApiService.simpleQuery = function(svc, rw, id, buckets, limit){
        return CrudApiService.raw("GET", compileParts(svc, rw, id, "/query" ), { buckets: buckets, limit : limit });
      };

      CrudApiService.advancedQuery = function(svc, rw, id, queryJson, buckets, limit ){
        return CrudApiService.raw("POST", compileParts(svc, rw, id, "/query" ), { buckets: buckets, limit : limit }, queryJson);
      };

      CrudApiService.getById = function(svc, rw, id, objectId, buckets, limit){
        return CrudApiService.raw("GET", compileParts(svc, rw, id, "/object/" + encodeURIComponent(objectId) ), { buckets: buckets, limit : limit });
      };

      //CrudApiService.simpleCount = function(svc, rw, id){
      //  return CrudApiService.raw("GET", compileParts(svc, rw, id, "/count" ), { buckets: buckets, limit : limit });
      //};

      CrudApiService.advancedCount = function(svc, rw, id, buckets){
        return CrudApiService.raw("GET", compileParts(svc, rw, id, "/count" ), { buckets: buckets });
      };

      CrudApiService.updateJson = function(svc, rw, id, buckets, updateJson){
        return CrudApiService.raw("PUT", compileParts(svc, rw, id, "/object" ), { buckets: buckets }, updateJson);
      };

      CrudApiService.deleteByQuery = function(svc, rw, id, buckets, queryJson){
        return CrudApiService.raw("PUT", compileParts(svc, rw, id, "/object" ), { buckets: buckets }, queryJson);
      };

      CrudApiService.deleteById = function(svc, rw, id, objectId, buckets, limit){
        return CrudApiService.raw("GET", compileParts(svc, rw, id, "/object/" + encodeURIComponent(objectId) ), { buckets: buckets, limit : limit });
      };

      // End Service definition
      return CrudApiService;
    }
  ]);
  /**
   * @typedef {Object} IkosValues
   * @property {","} BUCKET_SPLIT
   * @property {"/data/"} BUCKET_BINARY_DIR
   * @property {"DATA_SERVICE"} SERVICE_DATA
   * @property {"MANAGEMENT_DB"} SERVICE_MANAGEMENT
   * @property {"READ"} ACCESS_READ
   * @property {"WRITE"} ACCESS_WRITE
   * @property {"SEARCH_INDEX"} DATA_SEARCH_INDEX
   * @property {"STORAGE"} DATA_STORAGE
   * @property {"BUCKET_STORE"} MANAGEMENT_BUCKET_STORE
   * @property {"BUCKET_STATUS"} MANAGEMENT_BUCKET_STATUS
   * @property {"SHARED_LIBRARY"} MANAGEMENT_SHARED_LIBRARY
   * @property {"BUCKET_DATA"} MANAGEMENT_BUCKET_DATA
   */

  /**
   * @ngdoc service
   * @name ng-ikos.service:CrudApiService
   * @description IKOS Bucket Services
   */
  module.constant('IkosValues', {
    BUCKET_SPLIT : ",",
    BUCKET_BINARY_DIR : "/data/",

    SERVICE_DATA: "DATA_SERVICE",
    SERVICE_MANAGEMENT : "MANAGEMENT_DB",

    ACCESS_READ : "READ",
    ACCESS_WRITE : "WRITE",

    DATA_SEARCH_INDEX : "SEARCH_INDEX",
    DATA_STORAGE : "STORAGE",

    MANAGEMENT_BUCKET_STORE : "BUCKET_STORE",
    MANAGEMENT_BUCKET_STATUS : "BUCKET_STATUS",
    MANAGEMENT_SHARED_LIBRARY : "SHARED_LIBRARY",
    MANAGEMENT_BUCKET_DATA : "BUCKET_DATA"
  });

}) (angular.module ('ng-ikos', []));


