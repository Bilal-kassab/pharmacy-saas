-- CreateTable
CREATE TABLE "user_accounts" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");
