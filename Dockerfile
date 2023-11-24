FROM cypress/browsers:node-18.14.1-chrome-110.0.5481.96-1-ff-109.0-edge-110.0.1587.41-1
RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm install --force
RUN npm install -g cypress

RUN npx cypress verify

RUN ["npm", "run", "cypress:e2e"]
