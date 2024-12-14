// functions/index.js

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'supremeagrivetstore@gmail.com',
    pass: 'mbxk zgdn dadi kyxb' // Replace with a valid App Password for Gmail
  }
});

exports.sendEmail = functions.https.onCall(async (data, context) => {
  console.log('Received data in Cloud Function:', JSON.stringify(data, null, 2));

  const { name, email, message } = data;

  if (!name || !email || !message) {
    console.error('Missing required fields:', { name, email, message });
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const info = await transporter.sendMail({
      from: '"Supreme Agrivet" <supremeagrivetstore@gmail.com>',
      to: 'supremeagrivetstore@gmail.com',
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Error sending email');
  }
});
