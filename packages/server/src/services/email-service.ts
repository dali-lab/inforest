import dotenv from "dotenv";
import fs from "fs";
import { SendEmailCommand, SESv2, SESv2Client } from "@aws-sdk/client-sesv2";
import { getUsers } from "services";
import { getTeams } from "./team-service";

dotenv.config();

export const emailCode = async (verificationCode: {
  email: string;
  code: string;
}) => {
  const user = await getUsers({ email: verificationCode.email });
  if (user.length == 0) {
    throw new Error("This email is not connected to an account.");
  }
  if (user[0].verified) {
    throw new Error("This user has already been verified.");
  }

  // create SESv2 object to create template
  const sesv2 = new SESv2({ region: process.env.REGION });

  // try to create template; might already exist?
  try {
    const emailBody = fs.readFileSync("../res/code-email.html", "utf8");

    const template = {
      Subject: "Verify your Inforest account email",
      Html: emailBody,
    };

    sesv2.createEmailTemplate({
      TemplateName: "inforest-verification-code",
      TemplateContent: template,
    });
  } catch (e: any) {
    console.log("template exists?");
    console.log(e);
  }

  // send email
  const client = new SESv2Client({ region: process.env.REGION });

  const command = new SendEmailCommand({
    Content: {
      Template: {
        TemplateName: "inforest-verification-code",
        TemplateData: '{ "code":"' + verificationCode.code + '" }',
      },
    },
    Destination: { ToAddresses: [verificationCode.email] },
    FromEmailAddress: process.env.email,
  });

  await client.send(command);
};

export const emailInvitation = async (membership: {
  email: string;
  teamId: string;
}) => {
  // get team
  const team = (await getTeams({ id: membership.teamId }))[0];
  if (team == null) {
    throw new Error("This team does not exist.");
  }

  // create SESv2 object to create template
  const sesv2 = new SESv2({ region: process.env.REGION });

  // try to create template; might already exist?
  try {
    const emailBody = fs.readFileSync("../res/invitation-email.html", "utf8");

    const template = {
      Subject: "You have been invited to join Inforest",
      Html: emailBody,
    };

    sesv2.createEmailTemplate({
      TemplateName: "inforest-invitation",
      TemplateContent: template,
    });
  } catch (e: any) {
    console.log("template exists?");
    console.log(e);
  }

  // send email
  const client = new SESv2Client({ region: process.env.REGION });

  const command = new SendEmailCommand({
    Content: {
      Template: {
        TemplateName: "inforest-invitation",
        TemplateData: '{ "team_name":"' + team.name + '" }',
      },
    },
    Destination: { ToAddresses: [membership.email] },
    FromEmailAddress: process.env.email,
  });

  await client.send(command);
};
