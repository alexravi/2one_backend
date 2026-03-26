import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getBalance(userId: string): Promise<number> {
    let wallet = await this.walletsRepository.findOne({ where: { user: { id: userId } } });
    if (!wallet) {
      wallet = this.walletsRepository.create({
        user: { id: userId } as User,
        balance: 0.0,
      });
      await this.walletsRepository.save(wallet);
    }
    return wallet.balance;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async debit(userId: string, amount: number): Promise<void> {
    const wallet = await this.walletsRepository.findOne({ where: { user: { id: userId } } });
    if (!wallet) {
        throw new NotFoundException('Wallet not found');
    }
    
    if (wallet.balance < amount) {
        throw new Error('Insufficient funds');
    }

    wallet.balance -= amount;
    await this.walletsRepository.save(wallet);
  }

  async credit(userId: string, amount: number): Promise<void> {
    const wallet = await this.walletsRepository.findOne({ where: { user: { id: userId } } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance += amount;
    await this.walletsRepository.save(wallet);
  }
}
