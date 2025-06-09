# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN npm run build

# Run Prisma migrations (for production)
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 4000

# Start the app
CMD ["npm", "start"] 