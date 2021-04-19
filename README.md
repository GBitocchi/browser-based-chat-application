# jobsity-challenge
A simple browser-based chat application using Node.js

## Requirements
  * Allow registered users to log in and talk with other users in a chatroom.
  * Allow users to post messages as commands into the chatroom with the following format /stock=stock_code
  * Create a decoupled bot that will call an API using the stock_code as a parameter (https://stooq.com/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv, here aapl.us is the stock_code).
  * The bot should parse the received CSV file and then it should send a message back into the chatroom using a message broker like RabbitMQ. The message will be a stock quote using the following format: “APPL.US quote is $93.42 per share”. The post owner will be the bot.
  * Have the chat messages ordered by their timestamps and show only the last 50 messages.

## Bonus (Optional)
  * Have more than one chatroom. => DONE!
  * Unit test the functionality you prefer. => DONE!
  * Handle messages that are not understood or any exceptions raised within the bot. => DONE!

## Installation
  * You must have installed node in your system.
  * Pull the repository in one folder of your choice0
  * You will need to install RabbitMQ:3-management (To manage the queues between the bot and the chat app) and MongoDB (To handle the users and passwords). The first one I did it with docker toolbox with the following command: docker run -d --hostname jobsity-rabbit -p 5672:5672 -p 8081:15672 --name jobsity_rabbit rabbitmq:3-management. On the other hand, for the MongoDB, I installed and setted up a local version on my machine.
  * Edit both environment files in jobsity-chat folder and jobsity-decoupled-bot folder to meet your environment requirements. Every .env file explains itself their internal variables.
    ![image](https://user-images.githubusercontent.com/26705692/115178286-57536d80-a0a7-11eb-9ad9-0c971b34c933.png)
  * Execute the command: npm install inside jobsity-chat folder and jobsity-decoupled-bot folder to install node_modules.
  * Once you do the previous points, you can execute jobsity-chat app and jobsity-decoupled-bot apps both with the command: npm run dev in each folder (open different terminals).
  * If you want to run the test, execute the command: npm run test in jobsity-chat folder.
  * Now you have both app running on your machine. You could enter to the Jobsity-chat application in the port 8000 by default.
    ![image](https://user-images.githubusercontent.com/26705692/115178354-7c47e080-a0a7-11eb-837f-9a3b8f58fc40.png)
  * The last thing you will need are users. You have to create a collection called user in your jobsity database on MongoDB and add it as many documents as users you want. The structure of the document is the following: 
    ![image](https://user-images.githubusercontent.com/26705692/115178027-c5e3fb80-a0a6-11eb-9712-05b4ef3a4cbc.png)
  * When you enter to the application, it will ask you for a room, enter any name you want.
    ![image](https://user-images.githubusercontent.com/26705692/115178415-a13c5380-a0a7-11eb-8dee-9abaf00bc958.png)
