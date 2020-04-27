# chat-application

I have build this application in linux and tested on firefox. I don't see any reason not to work in any other environment.

### Installation
1. Clone the repo: `git clone https://github.com/gov-vj/chat-application.git`
2. Install docker and docker-compose or install mongo db.
3. If you install mongo db, you may have to make changes in connectMongodb.js.
4. Install node js and npm.
5. Go to the project root folder.
6. Run `npm install`
7. Run `docker-compose up -d`.  Not required if you installed mongodb directly. 
8. Run `npm start`
9. Go to `localhost:3000`
