# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose port frontend runs on (usually 3000)
EXPOSE 3000

# Start the frontend
CMD ["npm", "start"]
