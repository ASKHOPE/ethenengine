# Multi-stage production Dockerfile for Rust Microservices

FROM rust:1.75-alpine AS builder
WORKDIR /usr/src/app
RUN apk add --no-cache musl-dev
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.19 AS runner
WORKDIR /app
COPY --from=builder /usr/src/app/target/release/ethenengine-rust-services ./
EXPOSE 8080
CMD ["./ethenengine-rust-services"]
