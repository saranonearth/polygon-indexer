FROM node:16
# App directory
WORKDIR /app

# App dependencies
COPY package*.json ./
RUN npm i

# Copy app source code
COPY . .

# Env setup
COPY .env.development .env

#Expose port and begin application
EXPOSE 9000

# Start the app
CMD [ "npm", "run", "start:dev"]