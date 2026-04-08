import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.redirect(new URL("/ITXDesk.svg", request.url), 307)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/favicon.ico"],
}

