const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendManufacturerWelcomeEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Manufacturer Account Credentials',
    text: `Welcome! Your account has been created.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`,
    html: `<p>Welcome! Your account has been created.</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Temporary Password:</strong> ${password}</p>
           <p>Please change your password after logging in.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};