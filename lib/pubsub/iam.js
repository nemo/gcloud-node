/*!
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * @module pubsub/iam
 */

'use strict';

var is = require('is');
var arrify = require('arrify');

/*! Developer Documentation
 *
 * @param {module:pubsub} pubsub - PubSub Object
 * @param {string} resource - topic or subscription name
 */
/**
 * [IAM (Identity and Access Management)](https://cloud.google.com/pubsub/access_control)
 * allows you to set permissions on invidual resources and offers a wider range
 * of roles: editor, owner, publisher, subscriber, and viewer. This gives you
 * greater flexibility and allows you to set more fine-grained access control.
 *
 * For example:
 *   * Grant access on a per-topic or per-subscription basis, rather than for
 *     the whole Cloud project.
 *   * Grant access with limited capabilities, such as to only publish messages
 *     to a topic, or to only to consume messages from a subscription, but not
 *     to delete the topic or subscription.
 *
 *
 * *The IAM access control features described in this document are Beta,
 * including the API methods to get and set IAM policies, and to test IAM
 * permissions. Google Cloud Pub/Sub's use of IAM features is not covered by any
 * SLA or deprecation policy, and may be subject to backward-incompatible
 * changes.*
 *
 * @constructor
 * @alias module:pubsub/iam
 *
 * @resource [Access Control Overview]{@link https://cloud.google.com/pubsub/access_control}
 * @resource [What is Cloud IAM?]{@link https://cloud.google.com/iam/}
 *
 * @example
 * var pubsub = gcloud.pubsub({
 *   projectId: 'grape-spaceship-123',
 *   keyFilename: '/path/to/keyfile.json'
 * });
 *
 * var topic = pubsub.topic('my-topic');
 * // topic.iam
 *
 * var subscription = pubsub.subscription('my-subscription');
 * // subscription.iam
 */
function IAM(pubsub, resource) {
  this.resource = resource;
  this.makeReq_ = pubsub.makeReq_.bind(pubsub);
}

/**
 * Get the IAM policy
 *
 * @param {function} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {object} callback.policy - The [policy](https://cloud.google.com/pubsub/reference/rest/Shared.Types/Policy).
 * @param {object} callback.apiResponse - The full API response.
 *
 * @alias iam.getPolicy
 *
 * @resource [Topics: getIamPolicy API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.topics/getIamPolicy}
 * @resource [Subscriptions: getIamPolicy API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.subscriptions/getIamPolicy}
 *
 * @example
 * topic.iam.getPolicy(function(err, policy, apiResponse) {});
 *
 * subscription.iam.getPolicy(function(err, policy, apiResponse) {});
 */
IAM.prototype.getPolicy = function(callback) {
  var path = this.resource + ':getIamPolicy';

  this.makeReq_('GET', path, null, null, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    callback(null, resp, resp);
  });
};

/**
 * Set the IAM policy
 *
 * @throws {Error} If no policy is provided.
 *
 * @param {object} policy - The [policy](https://cloud.google.com/pubsub/reference/rest/Shared.Types/Policy).
 * @param {array=} policy.bindings - Bindings associate members with roles.
 * @param {object[]=} policy.rules - Rules to be applied to the policy.
 * @param {string=} policy.etag - Etags are used to perform a read-modify-write.
 * @param {function} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {object} callback.policy - The updated policy.
 * @param {object} callback.apiResponse - The full API response.
 *
 * @alias iam.setPolicy
 *
 * @resource [Topics: setIamPolicy API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.topics/setIamPolicy}
 * @resource [Subscriptions: setIamPolicy API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.subscriptions/setIamPolicy}
 * @resource [Policy]{@link https://cloud.google.com/pubsub/reference/rest/Shared.Types/Policy}
 *
 * @example
 * var myPolicy = {
 *   bindings: [
 *     {
 *       role: 'roles/pubsub.subscriber',
 *       members: ['serviceAccount:myotherproject@appspot.gserviceaccount.com']
 *     }
 *   ]
 * };
 *
 * topic.iam.setPolicy(myPolicy, function(err, policy, apiResponse) {});
 *
 * subscription.iam.setPolicy(myPolicy, function(err, policy, apiResponse) {});
 */
IAM.prototype.setPolicy = function(policy, callback) {
  if (!is.object(policy)) {
    throw new Error('A policy is required');
  }

  var path = this.resource + ':setIamPolicy';
  var body = {
    policy: policy
  };

  this.makeReq_('POST', path, null, body, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    callback(null, resp, resp);
  });
};

/**
 * Test a set of permissions for a resource.
 *
 * Permissions with wildcards such as `*` or `storage.*` are not allowed.
 *
 * @throws {Error} If permissions are not provided.
 *
 * @param {string|string[]} permissions - The permission(s) to test for.
 * @param {function} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {array} callback.permissions - A subset of permissions that the caller
 *     is allowed
 * @param {object} callback.apiResponse - The full API response.
 *
 * @alias iam.testPermissions
 *
 * @resource [Topics: testIamPermissions API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.topics/testIamPermissions}
 * @resource [Subscriptions: testIamPermissions API Documentation]{@link https://cloud.google.com/pubsub/reference/rest/v1/projects.subscriptions/testIamPermissions}
 * @resource [Permissions Reference]{@link https://cloud.google.com/pubsub/access_control#permissions}
 *
 * @example
 * //-
 * // Test a single permission.
 * //-
 * var test = 'pubsub.topics.update';
 *
 * topic.iam.testPermissions(test, function(err, permissions, apiResponse) {
 *   console.log(permissions);
 *   // {
 *   //   "pubsub.topics.update": true
 *   // }
 * });
 *
 * //-
 * // Test several permissions at once.
 * //-
 * var tests = [
 *   'pubsub.subscriptions.consume',
 *   'pubsub.subscriptions.update'
 * ];
 *
 * subscription.iam.testPermissions(tests, function(err, permissions) {
 *   console.log(permissions);
 *   // {
 *   //   "pubsub.subscriptions.consume": true,
 *   //   "pubsub.subscriptions.update": false
 *   // }
 * });
 */
IAM.prototype.testPermissions = function(permissions, callback) {
  if (!is.array(permissions) && !is.string(permissions)) {
    throw new Error('Permissions are required');
  }

  var path = this.resource + ':testIamPermissions';
  var body = {
    permissions: arrify(permissions)
  };

  this.makeReq_('POST', path, null, body, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    var availablePermissions = resp.permissions || [];

    var permissionsHash = body.permissions.reduce(function(acc, permission) {
      acc[permission] = availablePermissions.indexOf(permission) > -1;
      return acc;
    }, {});

    callback(null, permissionsHash, resp);
  });
};

module.exports = IAM;
