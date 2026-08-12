# Stage 1: build the Angular app
FROM node:20 AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install -f

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=8192

RUN npm run build:prod

# Stage 2: serve the static bundle.
# This app has no SSR — it is a single-page app, so nginx serves the files
# directly rather than running a node server.
FROM nginx:1.27-alpine AS serve

COPY --from=build /usr/src/app/dist/elementar-rt-admin/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
