-- CreateTable
CREATE TABLE "ResetPasswordModel" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResetPasswordModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordModel_token_key" ON "ResetPasswordModel"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordModel_userId_key" ON "ResetPasswordModel"("userId");

-- AddForeignKey
ALTER TABLE "ResetPasswordModel" ADD CONSTRAINT "ResetPasswordModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
