import dotenv from "dotenv";
import fs from "fs";
import { AlreadyExistsException, SESv2 } from "@aws-sdk/client-sesv2";

dotenv.config();

// set up credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
  secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
};

// create SESv2 object to create template
const sesv2 = new SESv2({ region: process.env.REGION, credentials });

try {
  const invitationEmailBody = fs.readFileSync(
    "res/invitation-email.html",
    "utf8"
  );

  const invitationTemplate = {
    Subject: "You have been invited to join Inforest",
    Html: invitationEmailBody,
  };

  sesv2.createEmailTemplate({
    TemplateName: "inforest-invitation",
    TemplateContent: invitationTemplate,
  });

  const codeEmailBody = fs.readFileSync("res/code-email.html", "utf8");

  const codeTemplate = {
    Subject: "Verify your Inforest account email",
    Html: codeEmailBody,
  };

  sesv2.createEmailTemplate({
    TemplateName: "inforest-verification-code",
    TemplateContent: codeTemplate,
  });
} catch (e: any) {
  if (e instanceof AlreadyExistsException) console.log("template exists");
  else throw e;
}
