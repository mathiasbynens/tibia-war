#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node --no-warnings get-fraggers.mjs 'We dont mind' > "data/vunira/fraggers-${date}.json";
node --no-warnings get-fraggers.mjs 'We dont care' 'Zero Respect' > "data/antica/fraggers-${date}.json";
node --no-warnings get-fraggers.mjs 'No Impact' > "data/thyria/fraggers-${date}.json";
