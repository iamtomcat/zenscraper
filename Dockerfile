FROM node:18.19.0-bullseye-slim as build

COPY src/ src/

COPY tsconfig.json package*.json ./

RUN npm ci && npm run build && npm prune --production

FROM public.ecr.aws/lambda/nodejs:18.2024.01.24.17

COPY --from=build node_modules/ ./node_modules

COPY --from=build dist/ ./dist

COPY --from=build package*.json ./

ENV NODE_ENV="production"

# Command can be overwritten by providing a different command in the template directly.
CMD ["dist/handlers/scheduled-event-logger.scheduledEventLoggerHandler"]
