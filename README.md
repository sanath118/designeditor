# designeditor - An AngularJS + MySQL + NodeJS app where you can play around with designs, upload images, add texts, flip them, save / load, and also track edit history!

1. Go to Parent Folder; Type "npm install". - press enter.
2. Open CMD from parent folder; Type "node index.js". -press enter.
3. Change port to 8090 in package.json
4. Node.js runs of localhost:3000

------------------------------------------------------------------------------

TO INSTALL: 
1. npm install --save express mysql body-parser.
2. CORS Extension on Chrome, and unrestrict connections.
3. A running version of MySQL Server and MySQL Workbench (to play around with DB).

----------------------------------------------------
THE PROJECT RUNS ON THE LATEST VERSION OF FABRIC.JS
----------------------------------------------------

STEPS TO RUN:
1. Open MySQL Workbench.
Run the query:
create database designerdb;
use designerdb;
CREATE TABLE `savedDesigns` (
  `id` varchar(255) NOT NULL DEFAULT '',
  `imagedata` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
2. Open VS CODE and run: npm start
3. Open CMD with admin previliges and run: node index.js
4. visit localhost:8090 on chrome.

---------------------------------------------------------------------------------------

Author: S A N A T H   K U M A R
