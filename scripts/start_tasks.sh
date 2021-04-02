#!/bin/bash
SCRIPT_DIR=$(cd $(dirname "$0") && pwd)

REPO=$1

until [ $# -eq 0 ]
do
  if [[ $# > 1 ]]; then
    $SCRIPT_DIR/start_task.sh $2 $REPO
  fi
  shift
done

echo "TASK DONE."