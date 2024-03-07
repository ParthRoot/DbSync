FROM node:19-alpine3.17 as base

WORKDIR /workspace

COPY . .

RUN apk update && apk upgrade \
    && apk add curl \
    && npm install --global -g pnpm jest @types/jest jest-junit ts-jest lerna ts-node \
    && pnpm clean \
    && pnpm install \
    && pnpm build


FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-19-bullseye as devcontainer

WORKDIR /workspace

COPY --from=base /workspace /workspace

RUN su node -c "npm install -g pnpm lerna" \
    && pnpm run clean \
    && pnpm install \
    && pnpm build \
    && chmod -x scripts/*.sh \
    && chmod a+w /workspace \
    && chown -R node:node /workspace



