import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "../../generated/prisma/client";

@Injectable()
export class UnitOfWork {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute<T>(
    work: (
      tx: Prisma.TransactionClient,
    ) => Promise<T>,
  ): Promise<T> {
     const result =
      await this.prisma.$transaction(work);
    return result;
  }
}