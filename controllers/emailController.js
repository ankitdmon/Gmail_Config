require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");

class EmailController {
  constructor() {
    this.oAuth2Client = null;
    this.labelName = "AutoReplied";
    this.emails = [];
    this.timeout = null;
  }

  async authorize() {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
  
    const credentials = {
      installed: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uris: [REDIRECT_URI],
      },
    };
  
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
    let token;
    try {
      token = fs.readFileSync('token.json');
      this.oAuth2Client.setCredentials(JSON.parse(token));
      return this.oAuth2Client;
    } catch (err) {
      return this.getAccessToken();
    }
  }  

  getAccessToken() {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/gmail.modify",
    });
    console.log("Authorize this app by visiting this URL!!!", authUrl);
  }

  async getUnrepliedEmails() {}

  async sendReply(email) {
    console.log(
      `Sending reply to email with subject "${email.subject}" from ${email.from}`
    );
  }

  async addLabel(emailId) {
    const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });

    try {
      const labels = await gmail.users.labels.list({
        auth: this.oAuth2Client,
        userId: "me",
      });

      const label = labels.data.labels.find(
        (label) => label.name === this.labelName
      );

      if (label) {
        await gmail.users.messages.modify({
          auth: this.oAuth2Client,
          userId: "me",
          id: emailId,
          resource: {
            addLabelIds: [label.id],
          },
        });
      } else {
        const newLabel = await gmail.users.labels.create({
          auth: this.oAuth2Client,
          userId: "me",
          resource: {
            name: this.labelName,
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          },
        });

        await gmail.users.messages.modify({
          auth: this.oAuth2Client,
          userId: "me",
          id: emailId,
          resource: {
            addLabelIds: [newLabel.data.id],
          },
        });
      }
    } catch (error) {
      console.error("Error adding label:", error);
    }
  }

  markAsReplied(email) {
    this.emails.push(email);
  }

  getRandomInterval() {
    const min = 45;
    const max = 120;
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  }

  async startListening() {
    try {
      const unrepliedEmails = await this.getUnrepliedEmails();
      if (unrepliedEmails > 0) {
        const randomEmailIndex = Math.floor(
          Math.random() * unrepliedEmails.length
        );
        const email = unrepliedEmails[randomEmailIndex];
        await this.sendReply(email);
        await this.addLabel(email.id, this.labelName);
        this.markAsReplied(email);
      }
    } catch (error) {
      console.error("Error occurred while listening for new emails:", error);
    } finally {
      const interval = this.getRandomInterval();
      this.timeout = setTimeout(() => this.startListening(), interval);
    }
  }
}

module.exports = EmailController;
