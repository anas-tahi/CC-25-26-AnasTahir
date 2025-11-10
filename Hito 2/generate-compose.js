// generate-compose.js
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const outputFile = path.join(__dirname, 'docker-compose.yml');

const services = fs.readdirSync(backendDir).filter(folder => {
  return fs.statSync(path.join(backendDir, folder)).isDirectory();
});

let composeYAML = `version: "3.9"\n\nservices:\n`;

let basePort = 4000; // starting host port

services.forEach(service => {
  composeYAML += `  ${service}:\n`;
  composeYAML += `    build:\n`;
  composeYAML += `      context: ./backend/${service}\n`;
  composeYAML += `      dockerfile: Dockerfile\n`;
  composeYAML += `    ports:\n`;
  composeYAML += `      - "${basePort}:${basePort}"\n`;
  composeYAML += `    volumes:\n`;
  composeYAML += `      - ./backend/${service}:/app\n`;
  composeYAML += `    restart: unless-stopped\n\n`;
  basePort += 1000; // increment host port for next service
});

fs.writeFileSync(outputFile, composeYAML);
console.log('docker-compose.yml generated successfully!');
