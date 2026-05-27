const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"AgileFlow" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`

async function sendEmail(to, subject, html) {
  if (!process.env.SMTP_HOST) return // email not configured, skip silently
  try {
    await transporter.sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('Email send error:', err.message)
  }
}

function assignmentEmail(userName, taskTitle, projectTitle) {
  return {
    subject: `[AgileFlow] You've been assigned: ${taskTitle}`,
    html: `<p>Hi ${userName},</p>
           <p>You have been assigned to the task <strong>${taskTitle}</strong> in project <strong>${projectTitle}</strong>.</p>
           <p>Log in to AgileFlow to view details.</p>`,
  }
}

function commentEmail(userName, commenterName, taskTitle, commentText) {
  return {
    subject: `[AgileFlow] New comment on: ${taskTitle}`,
    html: `<p>Hi ${userName},</p>
           <p><strong>${commenterName}</strong> commented on <strong>${taskTitle}</strong>:</p>
           <blockquote>${commentText}</blockquote>`,
  }
}

function statusChangeEmail(userName, taskTitle, oldStatus, newStatus) {
  return {
    subject: `[AgileFlow] Task status changed: ${taskTitle}`,
    html: `<p>Hi ${userName},</p>
           <p>The task <strong>${taskTitle}</strong> status changed from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>`,
  }
}

function digestEmail(userName, tasks) {
  const rows = tasks
    .map((t) => `<tr><td>${t.title}</td><td>${t.status}</td><td>${t.priority}</td><td>${t.projectId?.title || ''}</td></tr>`)
    .join('')
  return {
    subject: '[AgileFlow] Your daily task digest',
    html: `<p>Hi ${userName},</p>
           <p>Here is your daily summary of assigned tasks:</p>
           <table border="1" cellpadding="6" cellspacing="0">
             <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Project</th></tr></thead>
             <tbody>${rows}</tbody>
           </table>`,
  }
}

module.exports = { sendEmail, assignmentEmail, commentEmail, statusChangeEmail, digestEmail }
