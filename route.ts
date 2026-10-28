import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
const schema=z.object({orderId:z.string().min(1),status:z.enum(["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"])});
export async function GET(){const admin=await requireAdmin();if(!admin)return NextResponse.json({error:"Доступ запрещён."},{status:403});const orders=await prisma.order.findMany({include:{items:{include:{product:true}},user:{select:{name:true,email:true}}},orderBy:{createdAt:"desc"}});return NextResponse.json({orders});}
export async function PATCH(req:Request){const admin=await requireAdmin();if(!admin)return NextResponse.json({error:"Доступ запрещён."},{status:403});const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:"Некорректный статус."},{status:400});try{const order=await prisma.order.update({where:{id:parsed.data.orderId},data:{status:parsed.data.status}});return NextResponse.json({order})}catch{return NextResponse.json({error:"Заказ не найден."},{status:404})}}
