## `backend-nlp` API server

Database, API, business logic, and algorithms for wordio.co, besta.domains, and others.  

This is deployed using a github.com webhook: to https://api-staging.wordio.co when git push to `staging` and to `https://api.wordio.co` when git push to `main`.   

This is served using bash scripts in `_bash` folder. Node process is managed using `pm2`.

This is part of a monorepo github.com/paulshorey/harmony, but this is not imported as a dependency by any other project. This does depend on a couple modules from that repo though. This package is its own module. It is included in the monorepo as a submodule. 

<br />

## Getting started

### First of all...
This depends on a submodule `./secrets` which is a private git repo that contains some API keys for this server. This package will not build or serve without that folder. **So,**  
1. Run `bash _bash/reset-secrets.sh` to add `./secrets/constants.ts` and remove the git submodule references.  
2. Update the variables in the newly created `./secrets/constants.ts` to match your environment.  

However, it still won't work because this codebase relies on a database with specific schema. This readme and secret submodule is really just a starter for future projects.

### Start development server
run `yarn dev` or `bash _bash/_start_dev.sh` 

### Reset codebase to remote and start/restart server
This is NOT meant to deploy from your local machine to the remote server. Instead, this is meant to be run on the remote server. Run `bash _bash/_start.sh` on the server. This will pull the latest code from github, install dependencies, and restart the Node process.

**⚠️ WARNING: `_bash/_start.sh` is destructive. ⚠️** It will force update the entire codebase to remote origin/HEAD, losing any local changes. Then will start or restart the server. `_bash/_start_dev.sh` is the safe alternative.  

Essentially this acts as a docker container. But with a consistent local database and filesystem attached, and much faster deploy times.   