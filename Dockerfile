# Use a lightweight, official Node 22 LTS image (required by express-handlebars >= 22.22.2)
FROM node:22-alpine AS base

LABEL authors="Mess, Lucas"

# Set the working directory
WORKDIR /usr/src/app

# Copy package management files
COPY package*.json ./

# Install dependencies (use npm ci for reliable builds)
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose your application port
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]