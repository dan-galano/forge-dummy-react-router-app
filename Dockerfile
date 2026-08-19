# Forge React Router (framework mode) runtime image.
#
# Unlike the static-site and spa/react-vite templates, this app has a SERVER.
# `react-router build` emits TWO halves — build/client (browser assets, with
# public/ folded in by the build) and build/server/index.js (the request
# handler that runs loaders and actions) — and the app is served by
# `react-router-serve ./build/server/index.js`, which is what the template's
# own `start` script declares. So there is no nginx here and no document root
# to copy: the image carries a Node runtime, the production dependency tree,
# and both build outputs.
#
# Stage builds this image directly from the customer repo root (RFC-0064:
# image build moved from deploy -> stage). gate-build runs `npm ci` +
# `npm run build` before buildx, so ./build exists in the build context.
#
# Two stages so the runtime image does not carry devDependencies (vite,
# typescript, @react-router/dev, tailwind — roughly the whole toolchain).
# The deps stage resolves a production-only tree from the SAME committed
# package-lock.json the app was built against; the runtime stage copies that
# tree plus the build output and nothing else.
#
# PORT=80 is deliberate and is the contract with forge-deploy.yml's
# CONTAINER_PORT (which drives the ECS task-def portMapping, the ALB target
# group's port, and the service's load-balancer registration) as well as the
# hand-maintained security-group rules on the shared apps-demo cluster. Both
# sibling templates serve on 80; matching them means a react-router app needs
# no new SG rule and no divergent deploy workflow. react-router-serve reads
# process.env.PORT and, if it is UNSET, picks an arbitrary free port near
# 3000 (@react-router/serve resolves `parseNumber(process.env.PORT) ??
# getPort({port: 3000})`) — so PORT must be set explicitly here, not left to
# the default, or the container would listen somewhere the target group is
# not looking. Express binds all interfaces, which is what the awsvpc ENI
# needs.
#
# Runtime posture: root, matching the two sibling templates (binding :80 as an
# unprivileged user would need extra capabilities). Accepted as a demo-tier
# risk, same as the nginx images.

FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund


FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=80

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY ./build ./build

EXPOSE 80

CMD ["npm", "run", "start"]
