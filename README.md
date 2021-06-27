# Kathena Online Learning Management Platform

> [Kathena online learning manegement platform v1.0.1](https://kathena.app/)
> 
> NestJS, ReactJS, Typescript, GraphQL, MongoDB, Node Mailer,... 
>  
>  [![PRs Welcome](https://camo.githubusercontent.com/0ff11ed110cfa69f703ef0dcca3cee6141c0a8ef465e8237221ae245de3deb3d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265)](http://makeapullrequest.com/)  [ ![code style: prettier](https://camo.githubusercontent.com/c0486311910977832125780d8ef9ac681614939bd1b9328678007156a4648896/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f636f64655f7374796c652d70726574746965722d6666363962342e7376673f7374796c653d666c61742d737175617265)](https://github.com/prettier/prettier)  [![TypeScript](https://camo.githubusercontent.com/0c1107168e6e61f12e36d374e7425f1cccf108276f4c76c07482b9606f150fff/68747470733a2f2f6261646765732e66726170736f66742e636f6d2f747970657363726970742f617765736f6d652f747970657363726970742e706e673f763d313031)](https://github.com/ellerbrock/typescript-badges/) [![Discord](https://camo.githubusercontent.com/5d3982fe7c46884a0b3eeaabe0f87fb8a1c579c6df9e35a39599e15affe3dc98/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f646973636f72642d6f6e6c696e652d627269676874677265656e2e737667)](https://discord.gg/G7Qnnhy)

## Getting started
### Prerequisites
- Node: Install version 12.22.x or greater (Only version 12)
- Yarn:  [See installation instruction here](https://yarnpkg.com/lang/en/docs/install/)
- MongoDB: [See installation instruction here](https://docs.mongodb.com/manual/installation/)

### Installation

 -   Clone or fork this repository.
 -   Rename  `packages/server/.env.example`  to  `packages/server/.env`
 - Fill in your environment information same to `.env.example`

> Environment variables
> 
>  -   `PORT`: Your config port server (default: 4000).
> -   `MONGODB_URI`: Database connection string URI format.
>  -   `INIT_ADMIN_PWD`: Default password for initial admin user(Run with devtool).
>  - `ENABLE_DEVTOOL_MODULE`: Boolean ( `true`/ `false`) - Enable devtool.
>  - `FILE_STORAGE_UPLOADS_DIR`: Path to directory to storage the uploaded files. Relatives to this directory.
>  - `FILE_STORAGE_PROVIDER`: LocalStorage or AwsS3.
>  - `PORT_WEB`: Your config port web (default: 3000).
>  >Mail notification
>  > - `MAIL_HOST`: Your server mail.
>  > - `MAIL_USER`: Your mail user.
>  > - `MAIL_PASSWORD`: Your mail password.
>  > - `MAIL_FROM`: Your mail user.
>  > - `MAIL_DOMAIN`: Your web domain.
 -   Run  `yarn install`  to install npm dependencies.

### Running locally

Run  `yarn start:server`  to run backend and run `yarn start:web` to run frontend. 

### Communication Channels

The easiest way to communicate with the team is via GitHub issues.

Please file new issues, feature requests and suggestions, but **DO search for similar open/closed pre-existing issues before creating a new issue.**

Join Discord Server:  [https://discord.gg/nQvAdcGXUA](https://discord.gg/nQvAdcGXUA)

### License

I don't care!  😎
