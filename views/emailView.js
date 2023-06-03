class EmailView {
  displayEmails(emails) {
    console.log("Unreplied Emails!!!");
    emails.forEach((email) => {
      console.log("-----------------------------------");
      console.log(`ID: ${email.id}`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Sender: ${email.sender}`);
      console.log(`Body: ${email.body}`);
      console.log("-----------------------------------");
    });
  }
}

module.exports = EmailView;
