# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install all dependencies (including devDependencies) using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client (MUST be before build)
RUN pnpm exec prisma generate

# Build TypeScript
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 4000

# Start the app
CMD ["pnpm", "start"] 