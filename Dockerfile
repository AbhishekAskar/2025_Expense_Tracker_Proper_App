# Use an official Node.js base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for hot-reloading
RUN npm install -g nodemon

# Copy the rest of the app (backend + frontend)
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app with nodemon
CMD ["nodemon", "app.js"]
