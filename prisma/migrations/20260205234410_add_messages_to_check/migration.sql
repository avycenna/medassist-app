-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'PROVIDER');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssistanceType" AS ENUM ('TELECONSULTATION', 'CLINIC_CONSULT', 'HOME_VISIT', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('OWNER', 'PROVIDER', 'CLIENT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "patientName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "nationality" TEXT,
    "assistanceType" "AssistanceType",
    "referenceNumber" TEXT,
    "availability" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'EMAIL',
    "rawEmailContent" TEXT,
    "emailSubject" TEXT,
    "emailFrom" TEXT,
    "emailReceivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "approvedStatus" INTEGER,
    "assignedToAssistance" TEXT,
    "canCancelVoucher" TEXT,
    "clientName" TEXT,
    "codeAssist" TEXT,
    "codigo" TEXT,
    "descAssistanceType" TEXT,
    "idAssist" INTEGER,
    "idAssistanceType" INTEGER,
    "idUsersCreated" INTEGER,
    "isoCountry" TEXT,
    "isoCountrySource" TEXT,
    "origin" TEXT,
    "passport" TEXT,
    "prefijo" TEXT,
    "refund" TEXT,
    "registeredDate" TIMESTAMP(3),
    "reportedDate" TIMESTAMP(3),
    "specialityLocation" TEXT,
    "statusAssistIcon" TEXT,
    "statusAssistLabel" TEXT,
    "statusAssistStatus" TEXT,
    "symptom" TEXT,
    "symptomDetail" TEXT,
    "triageColor" TEXT,
    "triageLabel" TEXT,
    "triageStatus" TEXT,
    "view" TEXT,
    "voucherIsManual" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "clientFirstName" TEXT,
    "clientLastName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "intakeCompleted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "senderId" TEXT,
    "magicLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushSubscription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromStatus" "CaseStatus",
    "toStatus" "CaseStatus" NOT NULL,
    "changedBy" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedEmail" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "subject" TEXT,
    "from" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "caseId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastChecked" TIMESTAMP(3),
    "checkInterval" INTEGER NOT NULL DEFAULT 60,
    "messagesToCheck" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "smtpProviderId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmtpProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "useTLS" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBulk" BOOLEAN NOT NULL DEFAULT false,
    "lastTested" TIMESTAMP(3),
    "testStatus" TEXT,
    "testError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmtpProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_assignedToId_idx" ON "Case"("assignedToId");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- CreateIndex
CREATE INDEX "Case_isArchived_idx" ON "Case"("isArchived");

-- CreateIndex
CREATE INDEX "Case_deletedAt_idx" ON "Case"("deletedAt");

-- CreateIndex
CREATE INDEX "Case_idAssist_idx" ON "Case"("idAssist");

-- CreateIndex
CREATE INDEX "Case_codeAssist_idx" ON "Case"("codeAssist");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_tokenHash_key" ON "MagicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLink_tokenHash_idx" ON "MagicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLink_caseId_idx" ON "MagicLink"("caseId");

-- CreateIndex
CREATE INDEX "Message_caseId_idx" ON "Message"("caseId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "MessageRead_userId_idx" ON "MessageRead"("userId");

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "MessageRead"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "StatusHistory_caseId_idx" ON "StatusHistory"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEmail_messageId_key" ON "ProcessedEmail"("messageId");

-- CreateIndex
CREATE INDEX "ProcessedEmail_messageId_idx" ON "ProcessedEmail"("messageId");

-- CreateIndex
CREATE INDEX "DirectMessage_senderId_idx" ON "DirectMessage"("senderId");

-- CreateIndex
CREATE INDEX "DirectMessage_receiverId_idx" ON "DirectMessage"("receiverId");

-- CreateIndex
CREATE INDEX "DirectMessage_createdAt_idx" ON "DirectMessage"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_smtpProviderId_idx" ON "Campaign"("smtpProviderId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_idx" ON "CampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_email_idx" ON "CampaignRecipient"("email");

-- CreateIndex
CREATE INDEX "SmtpProvider_isActive_idx" ON "SmtpProvider"("isActive");

-- CreateIndex
CREATE INDEX "SmtpProvider_isBulk_idx" ON "SmtpProvider"("isBulk");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_magicLinkId_fkey" FOREIGN KEY ("magicLinkId") REFERENCES "MagicLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_smtpProviderId_fkey" FOREIGN KEY ("smtpProviderId") REFERENCES "SmtpProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
