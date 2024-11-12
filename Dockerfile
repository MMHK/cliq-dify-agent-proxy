FROM node:18-alpine

WORKDIR /app/cliq-dify-agent-proxy

COPY ./dist/bundle.cjs /app/cliq-dify-agent-proxy/bundle.cjs
COPY ./package.json /app/cliq-dify-agent-proxy/package.json

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && apk add --no-cache dumb-init \
  && echo "nodeLinker: node-modules" > /app/cliq-dify-agent-proxy/.yarnrc.yml \
  && yarn set version stable \
  && yarn workspaces focus --production \
  && rm -Rf ./.yarn \
  && chown nextjs:nodejs -Rf /app/cliq-dify-agent-proxy

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
  TZ=Asia/Hong_Kong \
  NODE_ENV=production \
  AUTH_TOKEN= \
  DIFY_API_KEY= \
  DIFY_API_URL= \
  ClIQ_BOT_INCOMING_URL= \
  CLIQ_WEBHOOK_TOKEN=

ENTRYPOINT ["dumb-init", "--"]

CMD node -- ./bundle.cjs
