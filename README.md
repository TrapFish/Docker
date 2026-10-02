Table of Contents

1. What is Docker?

2. Why Docker? — The Problem It Solves

3. Containers vs Virtual Machines

4. Docker Architecture

5. Docker Images

6. Docker Containers

7. Docker Hub and Registries

8. Essential Docker Commands

9. Ports and Port Mapping

10. Container Logs, Exec and Inspect

11. Docker Networking

12. Dockerfile

13. Docker Image Layers and Build Cache

14. .dockerignore

15. Docker Compose

16. Environment Variables and Configuration

17. Volumes and Persistent Storage

18. Bind Mounts vs Named Volumes

19. Dockerizing a Node.js Application

20. Dockerizing a React Application

21. Full-Stack React + Node + MongoDB with Compose

22. Production Considerations

23. Deployment to a Linux VPS

24. Common Problems and Troubleshooting

25. Docker Best Practices

26. Interview Questions and Answers

27. Hands-On Practice Plan

28. Docker Command Cheat Sheet

29. Final Mental Model

1. What is Docker?

Docker is a platform for packaging and running applications in isolated, reproducible environments called containers. An application and its required runtime, dependencies, configuration and supporting files can be packaged into an image and then started as a container.

Core mental model:

Dockerfile
    ↓ docker build
Docker Image
    ↓ docker run
Docker Container
    ↓
Running Application

Image = immutable package/template used to create containers.

Container = running or stopped instance of an image.

Dockerfile = instructions used to build an image.

Registry = place where images are stored and shared.

Compose = declarative way to run multiple related containers.

2. Why Docker? — The Problem It Solves

Without containerization, developers often encounter environment differences:

Different Node/Python/Java versions.

Different operating-system libraries.

Different package versions.

Different environment configuration.

A project works on one machine but fails on another.

Docker addresses this by making the application environment reproducible.

Developer machine
      ↓
Docker Image
      ↓
Same containerized application
      ↓
Development / Test / CI / Production

3. Containers vs Virtual Machines

Aspect

Container

Virtual Machine

Isolation

Process-level OS isolation

Full guest OS isolation

Startup

Usually seconds or less

Usually slower

Size

Usually smaller

Usually much larger

Kernel

Shares host kernel in typical Linux Docker setup

Has guest OS kernel

Use case

Apps/services/microservices

Full OS workloads

Important: containers are not simply lightweight VMs. They use operating-system isolation mechanisms and package the application/runtime environment.

4. Docker Architecture

A useful conceptual architecture is:

Docker CLI
   ↓
Docker Engine / daemon
   ↓
Images, Containers, Networks, Volumes
   ↓
Running application

Docker CLI is the command-line interface used by the developer.

Docker Engine manages images, containers, networks and volumes.

A registry stores images so they can be pulled/pushed.

Docker Desktop bundles Docker tooling for common desktop development workflows.

5. Docker Images

A Docker image is a packaged filesystem and metadata used to create containers. Images are normally built from layers.

docker images
docker pull nginx
docker pull nginx:1.31.5
docker image inspect nginx
docker rmi nginx

Image naming:

repository:tag

nginx:1.31.5
node:20
mongo:8

Tag identifies a particular image variant/version.

Avoid relying blindly on latest in production; pin versions where reproducibility matters.

6. Docker Containers

A container is an execution environment created from an image.

docker run nginx
docker run -d nginx
docker ps
docker ps -a
docker stop <container>
docker start <container>
docker restart <container>
docker rm <container>

Typical lifecycle:

Created → Running → Stopped → Started again → Removed

Stopping a container does not necessarily delete it.

Removing a container deletes the container object; persistent application data should be stored separately.

7. Docker Hub and Registries

A container registry stores Docker images. Docker Hub is a commonly used public registry.

docker login
docker pull <image>
docker tag <local-image> <registry-user>/<repository>:<tag>
docker push <registry-user>/<repository>:<tag>

Repository and registry are related but not identical concepts: a registry hosts repositories, and repositories contain image versions/tags.

8. Essential Docker Commands

Command

Purpose

docker --version

Show Docker CLI version

docker info

Show Docker Engine information

docker images

List local images

docker pull

Download an image

docker build

Build an image

docker run

Create/start a container

docker ps

List running containers

docker ps -a

List all containers

docker start

Start an existing container

docker stop

Stop a container

docker restart

Restart a container

docker rm

Remove a container

docker rmi

Remove an image

docker logs

View container logs

docker exec

Run a command inside a running container

docker inspect

Inspect Docker object metadata

docker network ls

List networks

docker volume ls

List volumes

9. Ports and Port Mapping

Containers can listen on ports internally. To access a service from the host, publish a port.

docker run -d -p 9000:80 nginx

The format is:

HOST_PORT:CONTAINER_PORT

So port 9000 on the host forwards to port 80 inside the container.

EXPOSE in a Dockerfile documents the intended container port; it does not itself publish the port to the host.

The -p option performs the actual host-to-container port publishing.

10. Container Logs, Exec and Inspect

docker logs <container>
docker logs -f <container>

docker exec -it <container> bash
docker exec -it <container> sh

docker inspect <container>

Use logs first when an application starts and immediately exits.

Use exec to inspect the running filesystem/process environment.

Use inspect for configuration, networking, mounts and metadata.

11. Docker Networking

Containers often need to communicate with other containers. Docker networks provide connectivity and service discovery.

docker network ls
docker network inspect <network>

With Docker Compose, services on the same Compose network can normally reach each other by service name.

services:
  backend:
    ...
  mongodb:
    ...

# Backend can typically use:
mongodb://mongodb:27017

Important localhost rule:

localhost inside a container refers to that same container.

It does not automatically mean the host machine.

It does not automatically mean another container.

For container-to-container communication, use the appropriate network/service name.

12. Dockerfile

A Dockerfile is a text file containing instructions for building an image.

FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

Instruction

Meaning

FROM

Base image

WORKDIR

Sets working directory

COPY

Copies files/directories into image

RUN

Executes command during image build

EXPOSE

Documents intended listening port

CMD

Default command when container starts

ENTRYPOINT

Defines executable/entry behavior

ENV

Sets environment variables

Build and run:

docker build -t my-app:v1 .
docker run -d -p 3000:3000 my-app:v1

13. Docker Image Layers and Build Cache

Dockerfile instructions generally contribute to image layers. Docker can reuse unchanged build layers.

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

For Node applications, copying package manifests and installing dependencies before copying the entire source tree can improve cache reuse when only application source changes.

14. .dockerignore

A .dockerignore file excludes unnecessary files from the build context.

node_modules
.git
.env
npm-debug.log
coverage
dist

Reduces build context size.

Avoids copying secrets and unnecessary development artifacts.

Can improve build performance.

15. Docker Compose

Docker Compose is used to define and manage multi-container applications declaratively.

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    build: ./backend
    ports:
      - "5000:5000"

  mongodb:
    image: mongo

docker compose up
docker compose up -d
docker compose up --build
docker compose ps
docker compose logs -f
docker compose down

Compose can create networks automatically for services in the application.

Compose makes local multi-service development repeatable.

A Compose file is configuration, not a replacement for understanding Docker fundamentals.

16. Environment Variables and Configuration

Applications commonly receive configuration through environment variables.

docker run -e NODE_ENV=production my-app

Compose example:

services:
  backend:
    environment:
      NODE_ENV: production
      PORT: 5000

Do not hard-code secrets in Dockerfiles.

Do not commit sensitive .env files to source control.

For production, use an appropriate secrets/configuration mechanism.

17. Volumes and Persistent Storage

Containers are disposable by design. Databases and other stateful services need persistent storage.

docker volume ls
docker volume inspect <volume>
docker volume rm <volume>

Compose example:

services:
  mongodb:
    image: mongo
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:

The conceptual flow is:

MongoDB container
      ↓
Named volume
      ↓
Persistent database data

18. Bind Mounts vs Named Volumes

Type

Example

Typical use

Bind mount

./data:/app/data

Developer-controlled host directory

Named volume

mongo-data:/data/db

Docker-managed persistent application data

Bind mounts are useful when you want live access to source files from the host.

Named volumes are commonly useful for database persistence.

19. Dockerizing a Node.js Application

Example project structure:

backend/
  package.json
  package-lock.json
  src/
    server.js
  Dockerfile
  .dockerignore

Example Dockerfile:

FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]

Build:

docker build -t my-node-api:v1 .
docker run -d -p 5000:5000 my-node-api:v1

The application must listen on the appropriate interface for containerized access; commonly 0.0.0.0 rather than only 127.0.0.1.

20. Dockerizing a React Application

A production React application is often built into static assets and then served by a web server such as Nginx.

# Build stage
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

This is a multi-stage build: the Node image is used for building, while the runtime image contains only the static output and web server.

21. Full-Stack React + Node + MongoDB with Compose

A useful architecture for a full-stack application is:

Browser
   ↓
React / Nginx container
   ↓
Node.js API container
   ↓
MongoDB container
   ↓
Named volume

Example Compose skeleton:

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URL: mongodb://mongodb:27017/appdb
    depends_on:
      - mongodb

  mongodb:
    image: mongo
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:

Important: depends_on expresses startup ordering relationships but should not be treated as a complete application-readiness/health mechanism. Production systems may require health checks and retry logic.

22. Production Considerations

Pin base image versions where reproducibility is important.

Use multi-stage builds to reduce runtime image size.

Use .dockerignore.

Avoid running applications as root when practical.

Do not bake secrets into images.

Use persistent storage for stateful workloads.

Use health checks where appropriate.

Send logs to a suitable centralized logging system in production.

Keep images patched and remove unnecessary packages.

Use CI/CD to build, test, scan and publish images.

Use an appropriate orchestration/deployment platform when the scale and operational needs justify it.

23. Deployment to a Linux VPS

A simple deployment flow for a Dockerized application is:

Developer
   ↓
Git repository
   ↓
Build/test
   ↓
Docker image
   ↓
Registry or server build
   ↓
Linux VPS
   ↓
Docker Compose
   ↓
Running services

Typical server steps:

git clone <repository>
cd <project>
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f

A real production deployment also needs firewall/network configuration, TLS/HTTPS, backups, monitoring, secret management and update strategy.

24. Common Problems and Troubleshooting

Problem

What to check

Container exits immediately

docker logs, CMD/ENTRYPOINT, application startup error

Port already in use

Host process/container using the host port

Cannot connect to another container

Network, service name, target port, application bind address

Database data disappears

Missing persistent volume

Build unexpectedly slow

Dockerfile ordering, build context, missing .dockerignore

Changes not reflected

Rebuild image or configure development bind mounts

Cannot access app from host

Published port and application listening interface

Permission errors

User/UID, mounted directory permissions, container user

25. Docker Best Practices

Use small, appropriate base images when practical.

Pin versions for reproducible builds.

Use multi-stage builds for compiled/build-heavy applications.

Keep Dockerfiles simple and ordered for cache efficiency.

Use .dockerignore.

Never store passwords/API keys directly in the Dockerfile.

Use one main concern/service per container in typical application architecture.

Persist state outside disposable containers.

Add health checks where they provide useful readiness/liveness information.

Build once and promote the same tested image through environments when possible.

26. Interview Questions and Answers

Q: What is Docker?

A: A platform for packaging and running applications in isolated containers.

Q: Image vs container?

A: An image is the package/template; a container is an instance created from that image.

Q: What is a Dockerfile?

A: A set of instructions used to build a Docker image.

Q: What does docker run do?

A: It creates a container from an image and starts it.

Q: What does -d mean?

A: Detached mode; the container runs in the background.

Q: What does -p 9000:80 mean?

A: Publish host port 9000 to container port 80.

Q: What is Docker Compose?

A: A tool for defining and managing multi-container applications.

Q: Why are volumes needed?

A: To persist data independently of the container lifecycle.

Q: What is a Docker registry?

A: A service that stores and distributes container images.

Q: Why use multi-stage builds?

A: To separate build tooling from the final runtime image and reduce image size.

Q: Why is localhost confusing in Docker?

A: localhost inside a container refers to that container itself.

Q: How do containers communicate?

A: Through Docker networks; Compose services can normally use service names for discovery.

Q: EXPOSE vs -p?

A: EXPOSE documents a container port; -p publishes a port to the host.

Q: How do you debug a container?

A: Check docker ps, docker logs, docker inspect and docker exec.

27. Hands-On Practice Plan

Exercise

Goal

Starting point

Exercise 1

Run Nginx

docker run -d -p 9000:80 nginx

Exercise 2

Inspect and debug

docker ps → docker logs → docker exec → docker inspect

Exercise 3

Build Node image

Create Dockerfile → docker build → docker run

Exercise 4

Add .dockerignore

Exclude node_modules, .git, .env and build artifacts

Exercise 5

Run React + Node

Create separate Dockerfiles and publish ports

Exercise 6

Add MongoDB

Run MongoDB as a third container

Exercise 7

Move to Compose

Define frontend/backend/database in compose.yaml

Exercise 8

Add persistence

Create a named MongoDB volume

Exercise 9

Add environment configuration

Move API/database configuration to environment variables

Exercise 10

Deploy

Run the Compose application on a Linux VPS

28. Docker Command Cheat Sheet

# Version / information
docker --version
docker version
docker info

# Images
docker images
docker pull <image>
docker build -t <name>:<tag> .
docker image inspect <image>
docker rmi <image>

# Containers
docker run <image>
docker run -d <image>
docker run -d -p 9000:80 nginx
docker ps
docker ps -a
docker start <container>
docker stop <container>
docker restart <container>
docker rm <container>

# Debugging
docker logs <container>
docker logs -f <container>
docker exec -it <container> sh
docker inspect <container>

# Networks
docker network ls
docker network inspect <network>

# Volumes
docker volume ls
docker volume inspect <volume>
docker volume rm <volume>

# Registry
docker login
docker tag <image> <user>/<repo>:<tag>
docker push <user>/<repo>:<tag>

# Compose
docker compose up
docker compose up -d
docker compose up --build
docker compose ps
docker compose logs -f
docker compose down

29. Final Mental Model

                         DOCKER

                         Dockerfile
                             │
                       docker build
                             ↓
                          IMAGE
                             │
                       docker run
                             ↓
                        CONTAINER
                       /    |                           /     |                        Network  Volume   Port
                    │        │       │
                    └────────┴───────┘
                             ↓
                       Application

Multiple containers
        ↓
   Docker Compose
        ↓
Frontend + Backend + Database
        ↓
Persistent volumes + Networks
        ↓
Deployment / Production

If you understand this model and can build, run, inspect, connect, persist, compose and deploy a small full-stack application, you have moved beyond memorizing Docker commands and into practical Docker usage.

Personal Learning Checklist

□ Understand image vs container

□ Run and stop containers

□ Publish ports

□ Read logs

□ Execute commands inside containers

□ Inspect containers/images

□ Understand Docker networking

□ Write a Dockerfile

□ Understand build layers and cache

□ Use .dockerignore

□ Write a Compose file

□ Connect Node.js to MongoDB using a Compose service name

□ Persist database data with a volume

□ Dockerize React

□ Use multi-stage builds

□ Push an image to a registry

□ Deploy a Compose application to a Linux VPS

Note on source coverage

These notes are a comprehensive study guide aligned to the shared course's published topic structure and standard Docker concepts. They are not a verbatim transcript of the YouTube video. Exact instructor wording, demonstrations, and any undocumented course-specific details may differ from these notes.# Docker
