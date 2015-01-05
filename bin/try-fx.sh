#!/bin/bash

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

cp ./manifest-extras.json ./data/manifest.json
node $SCRIPTPATH/ext/chr2moz/app.js
mkdir -p ~/.tmp/firefox/test-profile

cfx run --profiledir="~/.tmp/firefox/test-profile"