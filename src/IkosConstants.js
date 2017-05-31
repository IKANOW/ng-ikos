/*global angular*/
/**
 * @typedef {Object} IkosValues
 * @property {','} BUCKET_SPLIT
 * @property {'/data/'} BUCKET_BINARY_DIR
 * @property {'DATA_SERVICE'} SERVICE_DATA
 * @property {'MANAGEMENT_DB'} SERVICE_MANAGEMENT
 * @property {'READ'} ACCESS_READ
 * @property {'WRITE'} ACCESS_WRITE
 * @property {'SEARCH_INDEX'} DATA_SEARCH_INDEX
 * @property {'STORAGE'} DATA_STORAGE
 * @property {'BUCKET_STORE'} MANAGEMENT_BUCKET_STORE
 * @property {'BUCKET_STATUS'} MANAGEMENT_BUCKET_STATUS
 * @property {'SHARED_LIBRARY'} MANAGEMENT_SHARED_LIBRARY
 * @property {'BUCKET_DATA'} MANAGEMENT_BUCKET_DATA
 */

/**
 * @ngdoc service
 * @name ng-ikos.service:CrudApiService
 * @description IKOS Bucket Services
 */
angular.module('ng-ikos').constant('IkosValues', {
  BUCKET_SPLIT : ',',
  BUCKET_BINARY_DIR : '/data/',

  SERVICE_DATA: 'DATA_SERVICE',
  SERVICE_MANAGEMENT : 'MANAGEMENT_DB',

  ACCESS_READ : 'READ',
  ACCESS_WRITE : 'WRITE',

  DATA_SEARCH_INDEX : 'SEARCH_INDEX',
  DATA_STORAGE : 'STORAGE',

  MANAGEMENT_BUCKET_STORE : 'BUCKET_STORE',
  MANAGEMENT_BUCKET_STATUS : 'BUCKET_STATUS',
  MANAGEMENT_SHARED_LIBRARY : 'SHARED_LIBRARY',
  MANAGEMENT_BUCKET_DATA : 'BUCKET_DATA'
});