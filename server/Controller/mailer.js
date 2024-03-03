const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')



const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);


exports.registerMail = async (req, res) => {
    try {
      await transporter.sendMail({
        to: req.body.email,
        from: 'vaqsii23@gmail.com',
        subject: 'Registration Successful',
        html: '<h1>Welcome !</h1>',
      });
      res.status(200).send({ msg: 'Email sent successfully.' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({ error: 'Failed to send email.' });
    }
  };

  exports.recPassword = async(req, res) => {
    try {
      
      const token = req.body.token
      await   transporter.sendMail({
        to: req.body.email,
        from: 'vaqsii23@gmail.com',
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `
      });
    } catch (error) {
      console.log(error);
    }
  }