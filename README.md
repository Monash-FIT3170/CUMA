# CUMA

Project 6 CUMA (Course Unit Mapping Automation)

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
| Niroshan Sivaneeswaran      | nsiv0005@srudent.monash.edu |
| Ropafadzo Martha Chigumadzi | rchi0023@student.monash.edu |


## Documentation 
**MongoDB Implementation**

Deciding on the implementation of MongoDB and its accessibility to team members is important, and is based on several factors.

The options include:
1) Local Installation

Pros:
- Full control over the database environment.
- No network latency issues during development.
- Works offline.

Cons:
- Requires installation and configuration on each developer’s machine.
- May lead to inconsistencies in database versions or configurations across different machines.

2. Shared Database Server

You can set up a single MongoDB instance on a remote server that all developers connect to. This could be on a dedicated server or a cloud-based instance.

Pros:
- Centralized management of the database.
- Uniform environment for all developers.

Cons:
- Requires network connectivity.
- Possible performance degradation due to network latency.
- Higher risk of conflicts or interference between developers’ activities.

3. Docker Containers

Using Docker, you can create a MongoDB container that each developer runs on their local machine. This approach provides consistency across environments while still allowing each developer to work locally.

Pros:
- Consistent database environment across all machines.
- Easy to set up and tear down.
- Works well with continuous integration/continuous deployment (CI/CD) systems.

Cons:
- Requires Docker knowledge and setup on each developer’s machine.
- Still requires some local resources and might have issues with Docker on certain systems (eg., Windows Home).

4. Database as a Service (DBaaS)

Using a service like MongoDB Atlas or other cloud providers that offer MongoDB as a service. This is a fully managed solution.

Pros:
- No installation required; developers can connect to the database using the internet.
- Managed service includes backups, scalability, and maintenance.
- Often provides additional tools for monitoring and optimization.

Cons:
- Requires continuous internet connectivity.
- Cost associated with cloud services, which can vary based on usage.
- Potentially greater latency compared to local instances, depending on the geographical location of the server.

