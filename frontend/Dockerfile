FROM node:20-alpine

WORKDIR /app

# Copy package requirements
COPY frontend/package.json ./

# Install dependencies
RUN npm install

# Copy frontend files
COPY frontend/ ./

EXPOSE 3000

# Set environment target pointing to compose service name
ENV BACKEND_URL=http://backend:8000

# Start Vite dev server on host map
CMD ["npm", "run", "dev", "--", "--host", "3000"]
