FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN echo $(node --version)
RUN corepack enable
WORKDIR /app
COPY . .

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm -filter @klarluft/backend build
#COPY --from=base /app/apps/backend/firebase.json /app/apps/backend/dist/firebase.json

FROM node:20-slim
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/backend/node_modules /app/apps/backend/node_modules
COPY --from=build /app/apps/backend/dist /app/apps/backend/dist
COPY --from=build /app/apps/backend/package.json /app/apps/backend/package.json
CMD [ "node", "/app/apps/backend/dist/main.js"]