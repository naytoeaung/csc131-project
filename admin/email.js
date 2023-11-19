const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email wiwth a PDF using SendGrid
 * @param {*} buffer - file buffer
 * @param {*} information - a map in firestore containing subject, text, to, and attachmentName
 */
async function sendEmail(buffer, information) {  
    const msg = {
      to: information.to,
      from: process.env.SENDGRID_EMAIL,
      subject: information.subject,
      text: information.text,
      attachments: [
        {
          content: buffer.toString('base64'),
          filename: information.attachmentName,
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