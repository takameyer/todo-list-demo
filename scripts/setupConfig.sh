#!/bin/bash

printf "Please provide the URL of the sync server.\n This is probably the IP address of your computer and port 3000\n (ex. http://192.168.0.1:3000): "
read ipaddress
printf "Configuration app with sync server at: $ipaddress \n"
echo "SYNC_SERVER_URL=$ipaddress" > "./.env"

printf "If you need to do this again, please type the following command:\n $ yarn setupEnv \n"