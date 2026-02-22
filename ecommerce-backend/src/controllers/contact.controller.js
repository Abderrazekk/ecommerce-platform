const sendEmail = require("../utils/email");

const contactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Email content
    const mailOptions = {
      email: process.env.EMAIL_USERNAME,
      subject: `New Contact Message: ${subject}`,
      text:
        `You have received a new message from your website contact form.\n\n` +
        `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 20px 0;">New Contact Message</h2>
        
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
          <p style="margin: 10px 0;"><strong style="color: #555;">Name:</strong> <span style="color: #333;">${name}</span></p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Email:</strong> <span style="color: #333;"><a href="mailto:${email}">${email}</a></span></p>
          <p style="margin: 10px 0;"><strong style="color: #555;">Subject:</strong> <span style="color: #333;">${subject}</span></p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; border-radius: 3px;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #555;">Message:</strong></p>
          <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message from your contact form.</p>
      </div>
      `,
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
};

module.exports = { contactUs };
