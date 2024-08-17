# Secret Santa

This project is a simple CRUD application destinated to backend studies.

(2024-17-08) Secret-Santa is an API (without frontend yet) with endpoints to:  
  - login (to access endpoints that requires authentication)
  - register events, event groups and people in groups
  - sort event people among themselves with filter of groups

It has just the basic config of typescript with Node.js and SQL Postgres.

## Installation
After cloning:
```bash
npm install
```

To config enviroment variables, copy `.env.example` to `.env.`:
```bash
cp .env.example .env
```

## Use
To run the project, use the default command:
```bash
npm run dev
```

