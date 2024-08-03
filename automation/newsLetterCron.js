import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";


export const newsLetterCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Running Cron Automation");

        try {
            const jobs = await Job.find({ newsLettersSent: false });

            for (const job of jobs) {
                const filteredUsers = await User.find({
                    $or: [
                        { "niches.firstNiche": job.jobNiche },
                        { "niches.secondNiche": job.jobNiche },
                        { "niches.thirdNiche": job.jobNiche },
                    ],
                });

                for (const user of filteredUsers) {
                    const subject = `🚀 New Career Opportunity: ${job.title} at ${job.companyName}! 🚀`;

                    const message = `
Hi ${user.name},

🌟 **New Job Alert!** 🌟

We’re thrilled to share an exciting career opportunity that we believe is a perfect match for you:

**Position:** ${job.title}  
**Company:** ${job.companyName}  
**Location:** ${job.location}  
**Salary:** ${job.salary}

**What Makes This Role Special:**
- **Tailored for You:** This position aligns with your interest in ${job.jobNiche}.
- **Urgent Hiring:** The company is keen to fill this role quickly.
- **Career Growth:** A fantastic opportunity for advancement and learning.

💼 **Apply Now!** Don’t let this opportunity pass you by. Click [here] to apply or contact us for more details. We’re here to help you succeed!

Looking forward to seeing your application!

Best wishes,  
The NicheNest Team

📩CLICK HERE TO APPLAY:https://dev-website-portfolio.netlify.app/

P.S. Stay connected for more exciting job opportunities coming your way soon!
`;

                    await sendEmail({
                        email: user.email,
                        subject,
                        message,
                    });
                }

                job.newsLettersSent = true;
                await job.save();
            }
        } catch (error) {
            console.error("Error in Cron Job:", error);
        }
    });
};
