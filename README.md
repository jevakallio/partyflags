# partyflags ⛳️

`partyflags` is a minimalistic feature flagging implementation using PartyKit.

## Features

- Global and scoped flags
- Real-time push of updated flags
- Distributed on edge ⚡️

### TODO

- Web UI
- JavaScript client
- React client
- API documentation ()



## Architecture

`partyflags` is built entirely on PartyKit, a platform for real-time systems.

The project consists of three "parties":

- `main`: API server
- `scope`: Server real-time flags
- `flags`: Manages feature flags

## Server API

*  `GET  /flags/:projectId`: fetch global flags for project
*  `GET  /flags/:projectId/:scopeId`: fetch scope flags for project
*  `POST /flags/:projectId`: update global flags for project
*  `POST /flags/:projectId/:scopeId`: update scope flags for project
*  `POST /scopes/:projectId`: get all scopes with flags defined in this project



