FROM ubuntu:latest
# Use a lightweight, official Node image
FROM node:20-alpine AS base


#You should probably replace this
LABEL authors="Mess"



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
