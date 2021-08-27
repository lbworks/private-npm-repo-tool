#!/bin/bash -v
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

GLOBAL_DEPS_PATH=$SCRIPT_DIR/../resources/global-deps

if [[ -f $GLOBAL_DEPS_PATH ]]; then
  while read line || [[ -n ${line} ]]
  do
  echo "============================== $line begin =============================="
  package=$(expr "$line" : "\(.*\)@.*")
  npm uninstall -g $package
  rm -rf /lib/node_modules/.staging/
  npm cache clean -f
  npm cache verify
  npm install -g $line --registry=$1
  npm uninstall -g $package
  echo "============================== $line end =============================="
  done < $GLOBAL_DEPS_PATH
fi

echo "TASK DONE."