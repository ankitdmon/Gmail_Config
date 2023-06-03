const express = require('express');
const EmailController = require('./controllers/emailController');

class App {
  constructor() {
    this.port = process.env.port || 8081;
    this.emailController = new EmailController();
    this.app = express();
  }

  async startApp() {
    await this.emailController.authorize();

    this.app.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
      this.emailController.startListening();
    });
  }
}

const app = new App();
app.startApp();
