#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node --no-warnings get-fraggers.mjs 'Core' > "data/retalia/fraggers-${date}.json";
