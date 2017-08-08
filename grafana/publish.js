// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';
var request = require('request');
var config = require('./config');
var errors = require('./errors');
var q = require('q');

var _requestPromise = q.nbind(request);

/* eslint-disable max-statements, max-len, no-console, no-undef */
function publish(dashboard, opts) {
    opts = opts || {};
    
    if (!dashboard) {
        throw errors.UnfulfilledRequirement({
            component: 'grafana.publish',
            unfulfilledArg: 'dashboard'
        });
    }

    var state = dashboard.state;
    var cfg = config.getConfig();

    if ((!state || !state.title) && !dashboard.title) {
        throw errors.InvalidState({
            component: 'grafana.Dashboard',
            invalidArg: 'title',
            reason: 'undefined'
        });
    }

    if (!cfg.url) {
        throw errors.Misconfigured({
            invalidArg: 'url',
            reason: 'undefined',
            resolution: 'Must call grafana.configure before publishing'
        });
    }

    if (!cfg.cookie) {
        throw errors.Misconfigured({
            invalidArg: 'cookie',
            reason: 'undefined'
        });
    }

    var createData = {
        dashboard: (dashboard.generate ? dashboard.generate() : dashboard),
        overwrite: true
    };

    var j = request.jar();
    var cookie = request.cookie(cfg.cookie);
    j.setCookie(cookie, cfg.url);

    const requestOpts = {
        url: cfg.url,
        method: 'POST',
        json: createData,
        jar: j,
        timeout: opts.timeout || 1000
    };
    var logger = opts.logger;
    if (logger && logger.verbose) {
        logger.verbose(`[Request]: ${JSON.stringify(requestOpts)}`)
    }

    return _requestPromise(requestOpts);

}
/* eslint-enable */

module.exports = publish;
