const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


async function sendEmail(buffer) {  
    const msg = {
      to: 'naytoeaung99@gmail.com',
      from: 'naytoeaung@csus.edu',
      subject: 'PDF Attachment',
      text: 'Hello, this is your receipt',
      attachments: [
        {
          content: buffer.toString('base64'),
          filename: 'Receipt.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    sgMail
      .send(msg)
      .then(() => console.log('Email sent'))
      .catch((error) => console.error(error));
}

module.exports = { sendEmail };