# cloudify-kibana
Kibana integration for Cloudify UI



# useful commands in elasticsearch

## list all indexes 

https://www.elastic.co/guide/en/elasticsearch/reference/1.3/_list_all_indexes.html


`curl 'localhost:9200/_cat/indices?v'`


## How to export/import elasticsearch data

you can use https://github.com/taskrabbit/elasticsearch-dump

### install 

`npm install elasticdump -g`

### export


```
elasticdump --all=true --input=http://10.10.1.10:9200/ --output=dump.json

```

** we assume you are using the vagrant file which is exposed on 


### import 

```
elasticdump --bulk=true  --input=dump.json   --output=http://localhost:9200/
  
```
