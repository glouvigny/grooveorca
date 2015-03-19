#!/bin/bash

# install utillies (create firefox manifest file, locale files)
cd bin/
mkdir -p ext/
cd ext/
rm -rf chr2moz/
git clone https://github.com/Tuxkowo/chr2moz.git
cd chr2moz/
npm install
cd ../../../
mkdir -p locale/

# install frontend (popup) dependencies
cd data/
bower install
cd ../

# install backend dependencies
cd lib/
bower install
rm -rf ext/caoutchouc/
git clone git@github.com:Tuxkowo/caoutchouc.git ext/caoutchouc/
cd ext/caoutchouc/
bower install
cd ../../../