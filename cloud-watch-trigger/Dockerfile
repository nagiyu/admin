FROM public.ecr.aws/lambda/nodejs:22 AS base

FROM base AS builder

ARG PROCESS_ENV
ARG PROJECT_SECRET
ARG PROJECT_AWS_ACCESS_KEY
ARG PROJECT_AWS_SECRET_ACCESS_KEY
ARG PROJECT_AWS_REGION

WORKDIR /app

COPY typescript-common/common ./typescript-common/common
COPY admin ./admin
COPY cloud-watch-trigger ./cloud-watch-trigger

WORKDIR /app/typescript-common/common
RUN npm install

WORKDIR /app/admin
RUN npm install

WORKDIR /app/cloud-watch-trigger
RUN npm install && \
    npm run build

FROM base AS runner

ARG PROCESS_ENV
ARG PROJECT_SECRET
ARG PROJECT_AWS_ACCESS_KEY
ARG PROJECT_AWS_SECRET_ACCESS_KEY
ARG PROJECT_AWS_REGION

ENV PROCESS_ENV=${PROCESS_ENV}
ENV PROJECT_SECRET=${PROJECT_SECRET}
ENV PROJECT_AWS_ACCESS_KEY=${PROJECT_AWS_ACCESS_KEY}
ENV PROJECT_AWS_SECRET_ACCESS_KEY=${PROJECT_AWS_SECRET_ACCESS_KEY}
ENV PROJECT_AWS_REGION=${PROJECT_AWS_REGION}

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /app/cloud-watch-trigger/dist/* ./

CMD ["index.handler"]
