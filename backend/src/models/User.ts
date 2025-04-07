import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface User {
    id: number;
    name: string;
    full_name: string;
    number: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    bank_account_number: string;
    bank_account_balance: number;
    createdAt: Date;
    updatedAt: Date;
    verificationCode?: string;
    verificationCodeExpires?: Date;
    isVerified?: boolean;
    resetToken?: string;
    resetTokenExpiry?: Date;
}

export interface CreateUserInput {
    name: string;
    full_name: string;
    number: string;
    email: string;
    password: string;
    bank_account_number: string;
    bank_account_balance: number;
    role?: 'user' | 'admin';
}

export interface UpdateUserInput {
    name?: string;
    full_name?: string;
    number?: string;
    email?: string;
    password?: string;
    bank_account_number?: string;
    bank_account_balance?: number;
    role?: 'user' | 'admin';
}

const prisma = new PrismaClient();

export const userModel = {
    create: async (data: CreateUserInput) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await prisma.user.create({ data: { ...data, password: hashedPassword } });
    },
    findById: async (id: number) => {
        return await prisma.user.findUnique({ where: { id } });
    },
    findByEmail: async (email: string) => {
        return await prisma.user.findUnique({ where: { email } });
    },
    update: async (where: { id: number }, data: UpdateUserInput) => {
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
        }
        return await prisma.user.update({ where, data });
    },
    delete: async (where: { id: number }) => {
        return await prisma.user.delete({ where });
    },
    generateVerificationCode: async (userId: number) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 30);
        
        await prisma.user.update({
            where: { id: userId },
            data: {
                verificationCode: code,
                verificationCodeExpires: expiry
            }
        });
        return code;
    },
    verifyAccount: async (userId: number) => {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationCodeExpires: null
            }
        });
    },
    resetPassword: async (userId: number, newPassword: string) => {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
    }
};
