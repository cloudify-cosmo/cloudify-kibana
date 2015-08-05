var express = require('express');
var router = express.Router();
var conf = require('./conf.json');

const defaultDashboardsUrl="http://"+conf.kibana_ip+":"+conf.kibana_port+"/#/dashboard/";
const defaultDeploymentsUrl = "http://"+conf.kibana_ip+":"+conf.kibana_port+"/#/dashboard?_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-5y,mode:quick,to:now))&_a=(filters:!(),panels:!((col:1,id:message-text,row:1,size_x:8,size_y:4,type:visualization),(col:1,id:event_type,row:5,size_x:6,size_y:2,type:visualization),(col:7,id:timestamp,row:5,size_x:6,size_y:2,type:visualization),(col:9,id:type,row:1,size_x:4,size_y:4,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'*')),title:Default)";

router.get('/deployments', function (req, res) {
    res.redirect(defaultDeploymentsUrl)
});

router.get('/deployments/:deployment_id', function (req, res) {
    var currentKibanaRoute = '';
    var query = "deployment_id%3D@deployment_id";
    query = query.replace('@deployment_id', req.params.deployment_id);
    currentKibanaRoute = defaultDeploymentsUrl.replace('*', query);
    res.redirect(currentKibanaRoute);
});

router.get('/dashboards/:dashboard_id', function (req, res) {
    var currentKibanaRoute = '';
    currentKibanaRoute = defaultDashboardsUrl + req.params.dashboard_id;
    res.redirect(currentKibanaRoute);
});

module.exports = router;
