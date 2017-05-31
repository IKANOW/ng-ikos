/*global angular*/
/**
 * @ngdoc service
 * @name ng-ikos.service:CrudApiService
 * @description IKOS Bucket Services
 */
angular.module('ng-ikos').factory('CrudApiService', [ '$q', 'NgIkos',

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
      return encodeURIComponent(svc) + '/' + encodeURIComponent(rw) + '/' + encodeURIComponent(id) + ((!!suffix) ? suffix : '');
    }

    var CrudApiService = {};

    /**
     * Get the base URI for Bucket Requests
     * @returns {string}
     */
    CrudApiService.getBaseUri = function(){ return 'crud/'; };

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
      return CrudApiService.raw('POST', compileParts(svc, rw, id, '/object' ), { buckets: buckets }, jsonObject);
    };

    CrudApiService.createBucketFile = function(svc, rw, id, buckets, file){
      return CrudApiService.raw('POST', compileParts(svc, rw, id, '/file' ), { buckets: buckets }, file);
    };

    CrudApiService.simpleQuery = function(svc, rw, id, buckets, limit){
      return CrudApiService.raw('GET', compileParts(svc, rw, id, '/query' ), { buckets: buckets, limit : limit });
    };

    CrudApiService.advancedQuery = function(svc, rw, id, queryJson, buckets, limit ){
      return CrudApiService.raw('POST', compileParts(svc, rw, id, '/query' ), { buckets: buckets, limit : limit }, queryJson);
    };

    CrudApiService.getById = function(svc, rw, id, objectId, buckets, limit){
      return CrudApiService.raw('GET', compileParts(svc, rw, id, '/object/' + encodeURIComponent(objectId) ), { buckets: buckets, limit : limit });
    };

    //CrudApiService.simpleCount = function(svc, rw, id){
    //  return CrudApiService.raw('GET', compileParts(svc, rw, id, '/count' ), { buckets: buckets, limit : limit });
    //};

    CrudApiService.advancedCount = function(svc, rw, id, buckets){
      return CrudApiService.raw('GET', compileParts(svc, rw, id, '/count' ), { buckets: buckets });
    };

    CrudApiService.updateJson = function(svc, rw, id, buckets, updateJson){
      return CrudApiService.raw('PUT', compileParts(svc, rw, id, '/object' ), { buckets: buckets }, updateJson);
    };

    CrudApiService.deleteByQuery = function(svc, rw, id, buckets, queryJson){
      return CrudApiService.raw('PUT', compileParts(svc, rw, id, '/object' ), { buckets: buckets }, queryJson);
    };

    CrudApiService.deleteById = function(svc, rw, id, objectId, buckets, limit){
      return CrudApiService.raw('GET', compileParts(svc, rw, id, '/object/' + encodeURIComponent(objectId) ), { buckets: buckets, limit : limit });
    };

    // End Service definition
    return CrudApiService;
  }
]);