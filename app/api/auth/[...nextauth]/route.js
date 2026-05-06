import bcrypt from "bcrypt"
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prismadb"
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {  
    adapter: PrismaAdapter(prisma),
    providers: [ 
     GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     }),
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });
                if (!user || !user?.hashedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials")
                }

                return user
            },
        }),
    ],
        session: {
        strategy: "jwt",
        },
        pages: {
           signIn: "/login",
        },
        jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
        },
        secret: process.env.NEXTAUTH_SECRET,

        callbacks: {
        async signIn({ user, account }) {
        if (account.provider === "google") {
            const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            });

            if (!existingUser) {
            await prisma.user.create({
                data: {
                email: user.email,
                name: user.name,
                image: user.image,
                },
            });
            }
        }

        return true;
        },
    },
    };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
     

