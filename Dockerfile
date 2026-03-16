FROM nginxinc/nginx-unprivileged:1.18-alpine
USER root
RUN chown -R 1001 /usr/share/nginx/html
USER 1001
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
