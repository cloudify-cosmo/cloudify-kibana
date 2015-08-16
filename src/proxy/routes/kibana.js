var express = require('express');
var router = express.Router();

const defaultDashboardsUrl="@request_url/#/dashboard/";
const defaultDeploymentsUrl = "@request_url/#/dashboard?_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-5y,mode:quick,to:now))&_a=(filters:!(),panels:!((col:1,id:message-text,row:1,size_x:8,size_y:4,type:visualization),(col:1,id:event_type,row:5,size_x:6,size_y:2,type:visualization),(col:7,id:timestamp,row:5,size_x:6,size_y:2,type:visualization),(col:9,id:type,row:1,size_x:4,size_y:4,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'*')),title:Default)";

router.get('/deployments', function (req, res) {
    var requestUrl = req.protocol + '://' + req.get('host');
    var currentKibanaRoute = defaultDeploymentsUrl.replace('@request_url',requestUrl);
    res.redirect(currentKibanaRoute);
});

router.get('/deployments/:deployment_id', function (req, res) {
    var requestUrl = req.protocol + '://' + req.get('host');
    var currentKibanaRoute = defaultDeploymentsUrl.replace('@request_url',requestUrl);
    var query = "deployment_id%3D@deployment_id";
    query = query.replace('@deployment_id', req.params.deployment_id);
    currentKibanaRoute = currentKibanaRoute.replace('*', query);
    res.redirect(currentKibanaRoute);
});

router.get('/dashboards/:dashboard_id', function (req, res) {
    var requestUrl = req.protocol + '://' + req.get('host');
    var currentKibanaRoute = defaultDashboardsUrl.replace('@request_url',requestUrl);
    currentKibanaRoute = currentKibanaRoute + req.params.dashboard_id;
    res.redirect(currentKibanaRoute);
});

module.exports = router;
