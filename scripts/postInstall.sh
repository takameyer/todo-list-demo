#!/bin/bash

if [ ! -f .env ]; then bash scripts/setupConfig.sh; fi

cd ios && pod install

cd ../

cd server && yarn