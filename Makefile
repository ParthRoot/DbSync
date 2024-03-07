default:
#	make up

#up:
#	docker compose -f .devcontainer/docker-compose.yml up --renew-anon-volumes --force-recreate adminer -d

#down:
#	docker compose -f .devcontainer/docker-compose.yml down

install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

env:
	pnpm run update:env

migrate-up:
	make env
	pnpm run --filter @klarluft/backend migration:up

migrate-down:
	make env
	pnpm run --filter @klarluft/backend migration:down

migrate-generate:
	make env
	pnpm run --filter @klarluft/backend migration:generate

seed:
	make env
	pnpm run --filter @klarluft/backend seed

clear:
	pnpm clean

backend:
	make
	make env
	pnpm run --filter @klarluft/backend start:debug

frontend:
	pnpm run --filter @klarluft/frontend dev

backend-pm2-start-development:
	make
	make env
	pm2 start pnpm --name "backend-development" -- run --filter @klarluft/backend start:dev