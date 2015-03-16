#!/bin/bash

OUT='out/chrome'
OUT_ZIP=$OUT.zip

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

rm -rf $OUT
mkdir -p $OUT

cp -rf data lib _locales manifest-extras.json $OUT

r.js -o baseUrl=$OUT/lib/ name=main out=$OUT/lib/main-built.js findNestedDependencies=true

cp ./manifest-extras.json $OUT/data/manifest-extras.json

rm -rf $OUT/lib/ext/requirejs/
find $OUT/lib/ -type f -not -name 'main-built.js' -a -not -name 'require.js' | xargs rm -rf
find $OUT/data/ext/jquery/ -type f -not -name 'jquery.min.js' | xargs rm -rf

cd $OUT/
node $SCRIPTPATH/ext/chr2moz/manifest.js

find . -type d -empty | xargs rmdir -p

cd -

zip -r $OUT_ZIP $OUT