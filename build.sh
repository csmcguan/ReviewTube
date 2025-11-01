#!/bin/bash

npm ci --prefix client || npm install --prefix client
npm run build --prefix client

npm ci --prefix server || npm install --prefix server

