#!/bin/bash

OUT='out/firefox/'
TEST=0
PROFILE='~/.tmp/firefox/test-profile'

while getopts t:o:p: opts; do
   case ${opts} in
        t) TEST=${OPTARG} ;;
        p) PROFILE=${OPTARG} ;;
   esac
done

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

rm -rf $OUT
mkdir -p $OUT

cp -rf data lib _locales manifest-extras.json $OUT

cp ./manifest-extras.json $OUT/data/manifest-extras.json

find $OUT/data/ext/jquery/ -type f -not -name 'jquery.min.js' | xargs rm -rf

rm -rf $OUT/lib/ext/requirejs/
rm -rf $OUT/lib/ext/caoutchouc/ext/requirejs/
find $OUT/ -type d -iname ".*" -print0 | xargs rm -rf

cd $OUT/
mkdir -p locale
node $SCRIPTPATH/ext/chr2moz/manifest.js
node $SCRIPTPATH/ext/chr2moz/locales.js
rm -rf _locales/
rm manifest-extras.json
find . -type d -empty | xargs rmdir -p

cfx xpi --output-file=../firefox.xpi

if [ $TEST -ne 0 ]; then
    mkdir -p $PROFILE
    cfx run --profiledir="$PROFILE"
fi
