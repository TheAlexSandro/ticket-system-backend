# Use official Node.js image
FROM node:18

# Set the working directory
WORKDIR /src

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start"]