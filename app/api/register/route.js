// route.js
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"


export async function POST(request, response) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data:{
                email,
                name,
                hashedPassword: hashedPassword,
            },
        });

        console.log("REGISTER API HIT");

        return NextResponse.json(user)
    } catch (error) {
        console.log(error);
        return NextResponse.json(
  { error: "Something went wrong" },
  { status: 400 }
);     
    }
}