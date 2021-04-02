#!/bin/bash
SCRIPT_DIR=$(cd $(dirname "$0") && pwd)

project=$1
dir="$SCRIPT_DIR/../resources/projects/$project"
if [ -d ${dir} ];
then
  echo "============================== $project begin =============================="
  echo "$ cd $dir"
  cd "$dir"

  echo "$ npm cache clean -f"
  npm cache clean -f

  echo "$ npm cache verify"
  npm cache verify

  echo "$ rm -rf node_modules"
  rm -rf node_modules

  echo "$ npm install --registry=$2"
  npm install --registry=$2
  echo "$ cd .."
  cd ..
  echo "$ pwd"
  pwd
  echo "============================== $project end =============================="
fi