FROM public.ecr.aws/docker/library/nginx:stable-alpine
COPY build/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
