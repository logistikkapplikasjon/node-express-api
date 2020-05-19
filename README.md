# Node Express API

## Installasjon

### Installer git

legg inn git fra: https://git-scm.com/download

### Installer Node

Legg inn node fra: https://nodejs.org/en/ - applikasjonen er utviklet og testet i versjon 14.1.0

### Installer Xcode command tools / node-gyp / Visual Studio 2015 Build Tools

Legg inn Xcode command tools fra: https://developer.apple.com/download/more/ - applikasjonen er utviklet og testet på versjon 11.4.1
Eventuelt legg inn Visual Studio 2015 Build tools fra: https://www.microsoft.com/en-us/download/details.aspx?id=48159

### Klon Repo og installer

```
git clone https://github.com/logistikkapplikasjon/node-express-api.git
cd node-express-api
npm install
ved feilmeldinger på installasjon av tensorflow bruk:
npm i @tensorflow/tfjs-node@1.7.2
```

### Tilgjengelige scripts

```
npm run start - starter en bygget versjon av applikasjonen
npm run build - bygger applikasjonen
npm run dev - starter utviklingsmiljøet
npm run test - kjører testinstanser
npm run docs - generere dokumentasjon
```

### Dependencies

```json
  "dependencies": {
    "@babel/plugin-transform-runtime": "^7.9.0",
    "@babel/runtime": "^7.9.2",
    "@tensorflow/tfjs-node": "^1.7.2",
    "base64-to-uint8array": "^1.0.0",
    "bcrypt": "^4.0.1",
    "blueimp-load-image": "^5.12.0",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-validator": "^6.4.1",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "pg-promise": "^10.5.2",
  }
```

```json
  "devDependencies": {
    "@babel/cli": "^7.8.4",
    "@babel/core": "^7.9.0",
    "@babel/node": "^7.8.7",
    "@babel/preset-env": "^7.9.5",
    "@types/express": "^4.17.6",
    "babel-jest": "^25.5.1",
    "jest": "^25.5.1",
    "jsdoc": "^3.6.4",
    "nodemon": "^2.0.3",
    "supertest": "^4.0.2"
  }
```
