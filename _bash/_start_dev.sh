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
pm2 start ts-node -f -- --transpile-only --esm --experimental-specifier-resolution=node -r tsconfig-paths/register $rootdir/api --watch;
pm2 monit;
