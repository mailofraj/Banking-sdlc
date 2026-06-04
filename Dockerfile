FROM public.ecr.aws/docker/library/node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN node ./node_modules/react-scripts/scripts/build.js

FROM public.ecr.aws/docker/library/nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
