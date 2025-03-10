<div align="center">
<img width=30% src="https://github.com/user-attachments/assets/a92f27b9-5101-4725-8311-a0e6ada0edc7" alt="chat-summarizer-illustration">
</div>

<h1 align="center">Rocket.Chat AI Chat Summarizer App</h1>

We all get the annoying moments of scrolling through 80+ unread messages. With the
AI chat summarizer, these headaches become the past. This AI app
quickly turns messages in channels, DMs, or threads into a concise summary, boosting productivity for Rocket.Chat users.

<div align="center">
  <img width=60% src="https://github.com/user-attachments/assets/b42f85ba-c00c-44a8-a2c0-314081c9ad9a" alt="chat-summarizer-illustration">
</div>


<h2>Features 🚀</h2>
<ul>
  <li>Summarize messages in channel / DM / thread</li> 
  <li>Capture assigned tasks & participant summary in dialogue</li>
  <li>Suggest follow-up questions for quick reply </li>
  <li>Provide file summary of messages attachments</li> 
  <li>Support custom LLM selection</li>
  <li>Detect and block malicious prompt injection</li>
</ul>
<h2 >How to set up 💻</h2>

<ol>
  <li>Have a Rocket.Chat server ready. If you don't have a server, see this <a href="https://developer.rocket.chat/v1/docs/server-environment-setup">guide</a>.</li> 
  <li>Install the Rocket.Chat Apps Engline CLI. 
  
  ``` 
    npm install -g @rocket.chat/apps-cli
  ```
  
  Verify if the CLI has been installed 
  
  ```
  rc-apps -v
# @rocket.chat/apps-cli/1.4.0 darwin-x64 node-v10.15.3
  ```
  </li>
  <li>Clone the GitHub Repository</li>
    
 ```
    git clone https://github.com/RocketChat/Apps.Chat.Summarize.git
 ```
  <li>Navigate to the repository</li>
    
 ```
    cd Apps.Chat.Summarize
 ```
  
  <li>Install app dependencies</li>
  
  ```
    cd app && npm install
  ```
  
  <li>To install private Rocket.Chat Apps on your server, it must be in development mode. Enable Apps development mode by navigating to <i>Administration > General > Apps</i> and turn on "Enable development mode".</li>
  
  <li>Deploy the app to the server </li>
  
  ```
  rc-apps deploy --url <server_url> --username <username> --password <password>
  ```
  
  - If you are running server locally, `server_url` is http://localhost:3000. If you are running in another port, change the 3000 to the appropriate port.
  - `username` is the username of your admin user.
  - `password` is the password of your admin user.

  <li> Open the App, by navigating to <i>Administration > Marketplace > Private Apps</i>. You should see the app listed there. Click on the App name to open the app.</li>

  <li> Select the <i>Settings</i> tab and enter the LLM API Host URL. This is the URL of the LLM API you want to use. For example, if you are using OpenAI's GPT-3.5, the URL would be <a>https://api.openai.com</a> . If you are using a different LLM, enter the appropriate URL. Without any suffixes.</li>
  <li> If the LLM provider requires an API key, enter the API key in the <i>API Key</i> field. This is required for authentication with the LLM provider. Local deployments usually don't require an API key.</li>
</ol>

<h2>How to use 💬</h2>

Once setup is completed, type <code>/chat-summary</code> in the chat box of any channel / DM / thread, and you will see a summary of the messages like the one below.

<div align="center">
<img width="964" alt="Screenshot 2024-08-21 at 11 08 47 PM" src="https://github.com/user-attachments/assets/2193ee14-ff3f-431b-87af-ad7b1e1083d3">
</div>

<h2>Support us ❤️</h2>

If you like this project, please leave a star ⭐️. This helps more people to know this project.
