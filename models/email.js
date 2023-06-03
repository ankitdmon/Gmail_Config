class Email {
  constructor(id, subject, sender, body, replied) {
    this.id = id;
    this.subject = subject;
    this.sender = sender;
    this.body = body;
    this.replied = replied;
  }
}

module.exports = Email;
