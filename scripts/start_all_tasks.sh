#!/bin/bash

SCRIPT_DIR=$(cd $(dirname "$0") && pwd)

cd $SCRIPT_DIR/../resources/projects
for file in `ls`;
do
    if [ -d ${file} ];
        then
        $SCRIPT_DIR/start_task.sh $file $1
    fi
done
echo "TASK DONE."