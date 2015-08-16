#!/usr/bin/env bash
node $(dirname $0)/proxy/proxy.js &
bash $(dirname $0)/release/kibana-4.1.1/bin/kibana && fg
