FROM node:16.18.0-bullseye-slim as build

COPY src/ src/

COPY tsconfig.json package*.json ./

RUN npm ci && npm run build && npm prune --production

FROM public.ecr.aws/lambda/nodejs:16

COPY --from=build node_modules/ ./node_modules

COPY --from=build dist/ ./dist

COPY --from=build package*.json ./

# Command can be overwritten by providing a different command in the template directly.
CMD ["dist/handlers/scheduled-event-logger.scheduledEventLoggerHandler"]
