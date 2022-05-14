import dotenv from "dotenv";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
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

  const client = new SESv2Client({ region: process.env.REGION });

  const command = new SendEmailCommand({
    Content: {
      Template: { TemplateData: "" },
      Simple: {
        Body: {
          Html: {
            Data: "",
          },
        },
        Subject: {
          Data: "Verify your Inforest account email",
        },
      },
    },
    Destination: { ToAddresses: [verificationCode.email] },
    FromEmailAddress: process.env.email,
  });

  await client.send(command);

  // send the email
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

  const client = new SESv2Client({ region: process.env.REGION });

  const command = new SendEmailCommand({
    Content: {
      Template: { TemplateData: "" },
      Simple: {
        Body: {
          Html: {
            Data: "",
          },
        },
        Subject: {
          Data: "You have been invited to join Inforest",
        },
      },
    },
    Destination: { ToAddresses: [membership.email] },
    FromEmailAddress: process.env.email,
  });

  await client.send(command);
};
