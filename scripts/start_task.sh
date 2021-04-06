#!/bin/bash
# Copyright 2021 baiziyu
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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