FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
# Pretty sure this will work, essentially lifted from the weather one 
# But I've changed the start command as weather was monolithic
# Difficult to test this until the front end is connected.
