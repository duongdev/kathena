env

echo "APP_DOMAIN=$HEROKU_APP_NAME" >> packages/server/.env.local

yarn workspace web build
yarn workspace server build
