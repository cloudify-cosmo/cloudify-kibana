#!/bin/bash

set -e
set -v

sudo apt-get update -y

if [ ! -f /usr/bin/node ];then
    echo "installing node"
    NODEJS_VERSION=0.10.35
    NODEJS_HOME=/opt/nodejs
    sudo mkdir -p $NODEJS_HOME
    sudo chown $USER:$USER $NODEJS_HOME
    curl --fail --silent http://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.gz -o /tmp/nodejs.tar.gz
    tar -xzf /tmp/nodejs.tar.gz -C ${NODEJS_HOME} --strip-components=1
    sudo ln -s /opt/nodejs/bin/node /usr/bin/node
    sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
else
    echo "node already installed"
fi


if [ ! -f /usr/bin/java ]; then
    # https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-on-an-ubuntu-vps
    echo "install java"

    sudo add-apt-repository -y ppa:webupd8team/java
    sudo apt-get update
    echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections
    echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections
    sudo apt-get -y install oracle-java8-installer

else
    echo "java already installed"
fi


if [ ! -f /etc/init.d/elasticsearch ]; then
    echo "installing elasticsearch"

    wget -O - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
    echo 'deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main' | sudo tee /etc/apt/sources.list.d/elasticsearch.list
    sudo apt-get update
    sudo apt-get -y install elasticsearch=1.4.4

    sudo mv /vagrant/elasticsearch.yml /etc/elasticsearch
    sudo service elasticsearch restart
    sudo update-rc.d elasticsearch defaults 95 10


    echo "importing data to elasticsearch"
    sudo npm install elasticdump -g
    elasticdump --bulk=true  --input=/vagrant/dump.json   --output=http://localhost:9200/

else
    echo "elasticsearch already installed"
fi






