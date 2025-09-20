import { NextRequest, NextResponse } from "next/server";
export function middleware ( request: NextRequest )
{
  const token = request.cookies.get( "token" )?.value;

  const protectedRoutes = [
    "/user/profile",
    "/user/update-password",
    "/cms/purchase",
    "cms/tickets",
  ];

  if ( protectedRoutes.some( route => request.nextUrl.pathname.startsWith( route ) ) && !token )
  {
    const response = NextResponse.redirect( new URL( "/user/login", request.url ) );
    response.cookies.set( "show_login_toast", "true", {
      maxAge: 15,
      path: "/",
      sameSite: "strict"
    } );
    return response;
  }

  return NextResponse.next();
}