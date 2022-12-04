#!/bin/bash

#
# Install all monorepo dependencies
#
cwd=$( cd "$(dirname "$0")" ; pwd -P )
rootdir=$cwd/../
monodir=$rootdir/../../
cd $monodir
yarn
cd $rootdir

#
# Start node process
#
pm2 stop all < "/dev/null";
pm2 delete all < "/dev/null";
echo $(pwd);
PG_HOST=api-staging.wordio.co ts-node-esm --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register ./src --watch;
#143.244.214.169 

