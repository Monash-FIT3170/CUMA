# CUMA (Course Unit Mapping Automation) 

## Project 6 - FIT3170

## Team

| Member                      | Email                       |
| --------------------------- | --------------------------- |
| Zilei Chen                  | zche0160@student.monash.edu |
| David Batonda               | dbat0014@student.monash.edu |
| Michael Sigal               | msig0003@student.monash.edu |
| Jasmine See                 | jsee0012@student.monash.edu |
| Mark Song                   | mson0024@student.monash.edu |
| Maddy Prazeus               | tpra0008@student.monash.edu |
| Mishal FAOA Alhaidar        | malh0009@student.monash.edu |
| Jamie Gary Harrison         | jhar0038@student.monash.edu |
| Changheng Li                | clii0078@student.monash.edu |
| Sean Heng Keh               | skeh0003@student.monash.edu |
| Melvin Pramode              | mpra0021@student.monash.edu |
| Tharith Yeak                | tyea0002@student.monash.edu |
| Cheuk Lam Winnie Chui       | cchu0061@student.monash.edu |
| Sok Huot Ear                | sear0002@student.monash.edu |
| Niroshan Sivaneeswaran      | nsiv0005@student.monash.edu |
| Ropafadzo Martha Chigumadzi | rchi0023@student.monash.edu |

## How to connect to MongoDB:

install mongodb: 
    in root dir do: 
    npm install mongodb@6.5
### 1. Install Node.js and npm

https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

### 2. Setup Local Repository

Open command prompt or terminal in root dir.

Run "npm install" in root directory (CUMA).

### 3. Allow Database Access

Download the .env file and place into the root dir.

https://drive.google.com/file/d/1bq9kjm1LlIXsRHThCpEGvAytYSRSaz4t/view?usp=sharing
 

# How to run the server
In root do: `npm run server`

The server runs the API and connects to mongoDB. Therefore, this command must be run first
before npm install can be queried. 

# Getting started and setting up
## 1. Install dependencies
in root do: npm install

## 2. Ensure .env is valid
Download the .env file and place into the root dir.

https://drive.google.com/file/d/1bq9kjm1LlIXsRHThCpEGvAytYSRSaz4t/view?usp=sharing

# Project structrue

## Root Directory
The root directory is defined to be in the same hierarchy as app.js and package.json.

## cuma directory
`cuma` directory is separated as: 
    - `front-end`: contains the View and Controller. For example, `index.html` (view) will have a matching `index.js` file (for the controller logic). 
    -  `back-end`: Contains the interaction with the API tier
    - `api`: Contains the API logics, route handlers and the connection to the database. 

This web is designed to be a three-tier application, where `front-end` makes a call to `backend`. `backend` will then make a fetch request to the API. 

The API is handled by `api` where it will query the database. 





