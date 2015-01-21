#!/bin/bash

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

cp ./manifest-extras.json ./data/manifest-extras.json

cd lib/
r.js -o baseUrl=. name=main out=main-built.js findNestedDependencies=true
cd ..

node $SCRIPTPATH/ext/chr2moz/manifest.js
