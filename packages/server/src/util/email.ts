import dotenv from "dotenv";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { getUsers, getTeams } from "services";

dotenv.config();

export const emailCode = async (verificationCode: {
  email: string;
  code: string;
}) => {
  const user = await getUsers({ email: verificationCode.email });
  if (user.length == 0) {
    throw new Error("This email is not connected to an account.");
  }
  if (user[0].verified) return;

  // set up credentials
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
  };

  const client = new SESv2Client({ region: process.env.REGION, credentials });

  const command = new SendEmailCommand({
    Content: {
      Template: {
        TemplateName: "inforest-verification-code",
        TemplateData: '{ "code":"' + verificationCode.code + '" }',
      },
    },
    Destination: { ToAddresses: [verificationCode.email] },
    FromEmailAddress: process.env.EMAIL,
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

  // set up credentials
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
  };

  const client = new SESv2Client({ region: process.env.REGION, credentials });

  const command = new SendEmailCommand({
    Content: {
      Template: {
        TemplateName: "inforest-invitation",
        TemplateData: '{ "team_name":"' + team.name + '" }',
      },
    },
    Destination: { ToAddresses: [membership.email] },
    FromEmailAddress: process.env.EMAIL,
  });

  await client.send(command);
};
