#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node --no-warnings get-fraggers.mjs 'Core' > "data/bastia/fraggers-${date}.json";
node --no-warnings get-fraggers.mjs 'Nevermind' > "data/vunira/fraggers-${date}.json";
