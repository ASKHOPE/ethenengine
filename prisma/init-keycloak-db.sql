-- Initialize Keycloak Database alongside Platform DB
CREATE DATABASE keycloakdb;
GRANT ALL PRIVILEGES ON DATABASE keycloakdb TO platform;
