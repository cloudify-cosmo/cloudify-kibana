#!/bin/sh

# Based on ELK installation tutorial: https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-4-on-ubuntu-14-04

# Prerequisites:
# 1. Exported cloudify_events index data in cloudify_events.json file, using elasticsearch-tools node module
# 2. Exported cloudify_storage index data in cloudify_storage.json file, using elasticsearch-tools node module
# 3. Exported cloudify_events index mapping in cloudify_events.mapping file, using elasticsearch-tools node module
# 4. Exported cloudify_storage index mapping in cloudify_storage.mapping file, using elasticsearch-tools node module
# 5. Machine should allow inbound TCP 80 & 5601 ports
# 6. Git credentials cached

# Install Node
sudo apt-get remove node
sudo apt-get install -y nodejs
sudo apt-get update
sudo apt-get install -y npm
sudo ln -s /usr/bin/nodejs /usr/sbin/node

# Install Java 8
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections
echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections
sudo apt-get -y install oracle-java8-installer

# Install Elasticsearch
wget -O - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
echo 'deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main' | sudo tee /etc/apt/sources.list.d/elasticsearch.list
sudo apt-get update
sudo apt-get -y install elasticsearch=1.4.4
sudo mv elasticsearch.yml /etc/elasticsearch
sudo service elasticsearch restart
sudo update-rc.d elasticsearch defaults 95 10

# Import data to Elasticsearch
sudo npm install -g elasticsearch-tools
es-import-bulk --url http://localhost:9200 --file cloudify_events.json
es-import-bulk --url http://localhost:9200 --file cloudify_storage.json
es-import-mappings --url http://localhost:9200 --file ~/cloudify_events.mapping
es-import-mappings --url http://localhost:9200 --file ~/cloudify_storage.mapping

# Install Kibana 4
wget https://download.elasticsearch.org/kibana/kibana/kibana-4.0.1-linux-x64.tar.gz
tar xvf kibana-*.tar.gz
mv kibana.yml ./kibana-4*/config
mv cloudify.kibana.main.css ./kibana-4*/public/styles/main.css
sudo mkdir -p /opt/kibana
sudo cp -R ./kibana-4*/* /opt/kibana/
cd /etc/init.d && sudo wget https://gist.githubusercontent.com/thisismitch/8b15ac909aed214ad04a/raw/bce61d85643c2dcdfbc2728c55a41dab444dca20/kibana4
sudo chmod +x /etc/init.d/kibana4
sudo update-rc.d kibana4 defaults 96 9
sudo service kibana4 start

# Install Nginx
cd ~/cloudify-kibana
sudo apt-get install -y nginx apache2-utils
sudo mv default /etc/nginx/sites-available
sudo service nginx restart

# Install Cloudify UI
cd ..
rm -rf ~/tmp
git clone https://github.com/cloudify-cosmo/cloudify-ui.git
cd cloudify-ui
git checkout CFY-2938-kibana-poc
npm install
sudo npm install -g -y bower
bower install | xargs echo
sudo npm install -g -y grunt-cli
grunt build
