// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSSRSassClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const requestUrl = new URL(request.url)
        const code = requestUrl.searchParams.get('code')

        if (!code) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const supabase = await createSSRSassClient()
        const { error } = await supabase.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth error:', error)
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
        console.error('Callback error:', error)
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}