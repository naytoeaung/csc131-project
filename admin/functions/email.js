const sgMail = require('@sendgrid/mail');
const { Parser } = require('./fill.js');
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
      html: information.html,
      attachments: [
        {
          content: buffer.toString('base64'),
          filename: information.attachmentName,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    await sgMail.send(msg);
}

module.exports = { sendEmail };