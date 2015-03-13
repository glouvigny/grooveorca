#!/bin/bash

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

mkdir -p out/chrome/

cp ./manifest-extras.json ./data/manifest-extras.json

cd lib/
r.js -o baseUrl=. name=main out=main-built.js findNestedDependencies=true
cd ..

node $SCRIPTPATH/ext/chr2moz/manifest.js

cp -rf data lib _locales manifest.json out/chrome/

find out/chrome/data/ext/jquery/ -type f -not -name 'jquery.min.js' | xargs rm -rf

cd out/chrome/lib/
rm -rf ext/requirejs/
find . -type f -not -name 'main-built.js' -a -not -name 'require.js' | xargs rm -rf

cd ../
find . -type d -empty | xargs rmdir -p

cd ../
zip -r chrome.zip chrome