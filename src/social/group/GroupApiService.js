/*global angular*/
/**
 * @typedef {Group} DataGroup
 */

/**
 * @ngdoc service
 * @name ng-ikos.social.service:DataGroupApiService
 * @description
 *  * Data group API End points
 *
 * For more information on requests and responses please see the Infinite Sources API:
 * https://ikanow.jira.com/wiki/display/INFAPI/API+Reference
 */
angular.module('ng-ikos').factory('GroupApiService', [ '$q', 'NgIkos',

  function($q, NgIkos) {
    'use strict';

    // Service Object
    var GroupApiService = function(groupType){
      this.groupType = groupType === 'user' ? 'user' : 'data';
    };

    // ********************************************************************* //
    // Private URI Generators
    // ********************************************************************* //

    GroupApiService.prototype.getBaseUri = function(){
      return 'social/group/'+ this.groupType +'/';
    };

    // ********************************************************************* //
    // Main public API methods
    // ********************************************************************* //

    /**
     * @ngdoc method
     * @name raw
     * @methodOf  ng-ikos.social.service:GroupApiService
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
    GroupApiService.prototype.raw = function(method, endpointUri, queryParams, postData, alwaysResolve, forceContentType){
      return NgIkos.raw( method, this.getBaseUri() + endpointUri, queryParams, postData, alwaysResolve, forceContentType );
    };

    /**
     * @ngdoc method
     * @name add
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Add a new data group
     *
     * @param {String} name Name of new group
     * @param {String} description Description of this group's purpose
     * @param {Array<String>} tags A list of tags for this group
     * @param {ObjectId} [parentId=null] The parent group ID
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.add = function(name, description, tags, parentId){
      if(_.isEmpty(tags)) return $q.reject('Cannot create data group. Tags are required but empty.');
      return this.raw('POST', '', {}, {
        name: name,
        description: description,
        tags: tags,
        parent: parentId
      });
    };

    /**
     * @ngdoc method
     * @name getAll
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Get all data groups
     *
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.getAll = function(){
      return this.raw('GET', '');
    };

    /**
     * @ngdoc method
     * @name get
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Get a data group record by ID
     *
     * @param {ObjectId} groupId ID Of group to query
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.get = function(groupId){
      return this.raw('GET', encodeURIComponent(groupId));
    };

    /**
     * @ngdoc method
     * @name update
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Update a data group by ID. The data group used here will need an _id attribute
     *
     * @param {Group} dataGroupObject The community to update.
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.update = function(dataGroupObject){
      if(!dataGroupObject){ return $q.reject('Data group object is empty.'); }
      if(!dataGroupObject._id){ return $q.reject('Cannot update a data group without an ID.'); }
      return this.raw('PUT', '', {}, dataGroupObject);
    };

    /**
     * @ngdoc method
     * @name remove
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Remove a group by id. First attempt will disable the group, second will permanently
     * delete the group.
     *
     * @param {ObjectId} groupId The group to remove.
     * @returns {Promise<void>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.remove = function(groupId){
      return this.raw('DELETE', encodeURIComponent(groupId));
    };

    /**
     * @ngdoc method
     * @name addMembers
     * @methodOf  ng-ikos.social.service:GroupApiService
     * @description
     * Invite ( or add for admins ) users or user groups to a data group. This api method can return success:false
     * even during a partial success so there's some extra handling here.
     *
     * @param {ObjectId} groupId ID Of group to add member
     * @param {Array<ObjectId>} memberIds Members to be added to group in an array if IDs
     * @returns {Promise<IKOSApiResponse>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.addMembers = function(groupId, memberIds){
      return this.raw('POST', encodeURIComponent(groupId) + '/member', {}, memberIds, true );
    };

    /**
     * Remove members from a group
     * @param groupId
     * @param memberIds
     * @return {Promise<void>} IKOSApiResponse on success.
     */
    GroupApiService.prototype.removeMembers = function(groupId, memberIds){
      return this.raw('DELETE', encodeURIComponent(groupId) + '/member', {}, memberIds, true );
    };

    return GroupApiService;
  }
]);