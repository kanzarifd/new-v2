import nodemailer from 'nodemailer';

export const sendResetEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fedy22ka@gmail.com',
      pass: 'mhvymcjkuzzkvzzd',
    },
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Support Team" <fedy22ka@gmail.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};
