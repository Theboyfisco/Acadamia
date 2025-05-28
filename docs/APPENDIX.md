# School Management System - Code Appendix

This document contains the key code components of the School Management System.

## Table of Contents
1. [Prisma Schema](#prisma-schema)
2. [Authentication Middleware](#authentication-middleware)
3. [UserCard Component](#usercard-component)
4. [Prisma Client](#prisma-client)
5. [Environment Configuration](#environment-configuration)

## Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   // 'admin', 'teacher', 'student', 'parent'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  admin    Admin?
  teacher  Teacher?
  student  Student?
  parent   Parent?
}

model Admin {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

model Teacher {
  id       String   @id @default(cuid())
  userId   String   @unique
  user     User     @relation(fields: [userId], references: [id])
  subjects String[]
  classes  String[]
}

model Student {
  id       String  @id @default(cuid())
  userId   String  @unique
  user     User    @relation(fields: [userId], references: [id])
  grade    String
  parentId String?
  parent   Parent? @relation(fields: [parentId], references: [id])
}

model Parent {
  id       String   @id @default(cuid())
  userId   String   @unique
  user     User     @relation(fields: [userId], references: [id])
  children Student[]
}
```

## Authentication Middleware

```typescript
// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## UserCard Component

```tsx
// src/components/UserCard.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";

interface UserCardProps {
  type: "admin" | "teacher" | "student" | "parent";
}

const UserCard = async ({ type }: UserCardProps) => {
  const modelMap = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const count = await modelMap[type].count();
  
  const cardData = {
    admin: { title: "Admins", icon: "/admin.png" },
    teacher: { title: "Teachers", icon: "/teacher.png" },
    student: { title: "Students", icon: "/student.png" },
    parent: { title: "Parents", icon: "/parent.png" },
  }[type];

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <button aria-label={`More ${type} options`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-sm mt-1">{cardData.title}</p>
      </div>
    </div>
  );
};

export default UserCard;
```

## Prisma Client

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client/edge';

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
```

## Environment Configuration

```env
# .env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/school_management?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*
CLERK_SECRET_KEY=sk_test_*
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
```
