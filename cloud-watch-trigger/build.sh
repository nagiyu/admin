#!/bin/bash

docker build \
  --build-arg PROCESS_ENV=local \
  --build-arg PROJECT_SECRET=DevAdmin \
  --build-arg PROJECT_AWS_ACCESS_KEY= \
  --build-arg PROJECT_AWS_SECRET_ACCESS_KEY= \
  --build-arg PROJECT_AWS_REGION= \
  -f cloud-watch-trigger/Dockerfile \
  -t dev-cloud-watch-trigger .
