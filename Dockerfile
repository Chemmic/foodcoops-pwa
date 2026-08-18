# =============================================================================
# Stage 1: Frontend bauen
# =============================================================================

FROM node:22.22-alpine AS build

WORKDIR /app


# -----------------------------------------------------------------------------
# Vite Build-Variablen
# -----------------------------------------------------------------------------

ARG VITE_BACKEND_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}


# -----------------------------------------------------------------------------
# Dependencies
# -----------------------------------------------------------------------------

COPY package*.json ./

RUN npm ci


# -----------------------------------------------------------------------------
# Source
# -----------------------------------------------------------------------------

COPY . .


# -----------------------------------------------------------------------------
# Vite Production Build
# -----------------------------------------------------------------------------

RUN npm run build


# =============================================================================
# Stage 2: Nginx
# =============================================================================

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]