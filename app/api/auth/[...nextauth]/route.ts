// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // 从外部导入配置

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };