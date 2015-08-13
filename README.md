Overview:
=========
This is a project we have started currently stopped, integrating Kibana with the Cloudify UI.
”Kibana is an open source data visualization platform that allows you to interact with your data through stunning, powerful graphics.”

Basically it is connected directly to Elasticsearch, running queries and visualizing the data. We chose Kibana because we like to let our users the option to create custom dashboards to present Cloudify logs.

```
NOTE: Kibana requires Elasticsearch version to be at least 1.4.4
```



## useful commands in elasticsearch

### list all indexes 

https://www.elastic.co/guide/en/elasticsearch/reference/1.3/_list_all_indexes.html


`curl 'localhost:9200/_cat/indices?v'`


### How to export/import elasticsearch data

you can use https://github.com/taskrabbit/elasticsearch-dump

#### install 

`npm install elasticdump -g`

#### export


```
elasticdump --all=true --input=http://10.10.1.10:9200/ --output=dump.json

```

** we assume you are using the vagrant file which is exposed on 


### import 

```
elasticdump --bulk=true  --input=dump.json   --output=http://localhost:9200/
  
```

___


###Cloudify-Kibana repo
The repository: https://github.com/cloudify-cosmo/cloudify-kibana
To build the project run:
```sh
Grunt build
```
To run the project (Kibana+Kibana-proxy):
```sh
Grunt server
```

###Kibana scss
We have created a mechanism that allows us to override Kibana’s css.
Under the root of the project- app/styles/ folder contains Cloudify-Kibana scss. Editing this scss will impact Kibana as it is injected to Kibana during build and Kibana runtime.

###Kibana-proxy
Kibana-proxy is a simple nodeJs server that redirects a request to the same domain as the request with an added portion to the URL that builds a Kibana dashboard.

####It accepts 3 kind of requests:

- /deployments – redirect to a default dashboard we are creating with a ‘*’ query
- /deployments/:deployment_id – redirect to the same default dashboard with a ‘deployment_id= USER_INPUT_DEPLOYMENT_ID’ query
- /dashboards/:dashboard_id – redirect to a requested dashboard

Running grunt build copies the proxy from src/proxy to .tmp/kibana/ and grunt server runs the proxy.

```
NOTE: creating dashboards by changing URL requires Elasticsearch to contain the visualizations! Currently Cloudify-Kibana blueprint does not add default visualizations to Elasticsearch.
```

###Kibana elasticsearch requests proxy
To understand all of Kibana’s http requests to Elasticsearch we have created a proxy that channels requests from Kibana to Elasticsearch and writing each request’s Method,URL and Body to ‘traffic’ file in the same directory - listener/ .


###Cloudify kibana blueprint
Bootstrapping this blueprint currently need the support of a specific Cloudify-cli.
First Uninstall Cloudify cli from a vagrant box:
pip uninstall cfy

Then run this to install the right cli and its dependencies:
pip install https://github.com/cloudify-cosmo/cloudify-cli/archive/CFY-2884-adjust-cli-for-new-bootstrap-method.zip -r https://raw.githubusercontent.com/cloudify-cosmo/cloudify-cli/CFY-2884-adjust-cli-for-new-bootstrap-method/dev-requirements.txt

The matching manager simple blueprint:	
https://github.com/cloudify-cosmo/cloudify-manager-blueprints/tree/CFY-2980-simple-boostrap-kibana-as-part-of-ui

```
NOTE: this manager runs on Centos7 image.
```

###Kibana security + alias
Since Kibana is working directly with Elasticsearch it gives access to all the data for all users.
In order to support authorization we have experimented with aliases.
Elasticsearch alias is a virtual index that allows filters, much like a view in relational databases.

Aliases filter the information if they are accessed directly - localhost:9200/alias/_search.
Kibana requests to Elasticsearch are /mget and /msearch which works different from accessing an index directly.

Also here is an article about aliases limitations that should be consider when choosing alias for security:
https://www.elastic.co/guide/en/shield/current/limitations.html



