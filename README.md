Auto encuestas UTN Mendoza
This website is an open source project by students for students and no teacher or manager has any relationship with it. This page is still under development, so it is recommended to check that the surveys have been completed and to notify about aesthetic or functional failures is highly appreciated.

Description
Auto encuestas UTN Mendoza simplifies the answering of the profesor surveys of UTN Mendoza. This is posible by making one GET and two POST request to the college server.

Technologies
node.js
express
axios
cherio
bootstrap
How to use
Enter a valid file number, if it is not, an alert alerts the error, if all the surveys are already completed, an alert will inform you.
Indicate which surveys you want to carry out, by default they are all marked.
Indicate how to fill out the surveys, once marked they will all be filled out equally, BAD: equals insufficient, GOOD: equals always / excellent, the open questionnaires remain blank in any case.
By clicking on "answer" all the answers will be sent, this process may take a few seconds, the waiting time varies depending on the number of surveys that must be sent.
Once the process is finished, three buttons are displayed: Start: redirects to the home page, Check surveys: redirects to the selection of self-management surveys, Self-management: redirects to the start of self-management.