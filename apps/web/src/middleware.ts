import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cambiar-en-produccion-clave-minimo-256-bits-segura"
);

// Define public and role-protected routes
const PUBLIC_ROUTES = ["/login", "/api/v1/auth/login", "/api/v1/auth/refresh"];
const ADMIN_ONLY_PREFIXES = ["/api/v1/settings", "/api/v1/predictions/batch-run", "/api/v1/admin", "/admin"];
const TUTOR_EXCLUDED_PREFIXES = ["/api/v1/reports"]; // Tutors cannot access reports
const DIRECTOR_EXCLUDED_PREFIXES = ["/api/v1/interventions"]; // Directors cannot access interventions

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public API routes (login, refresh)
  const isApiRoute = pathname.startsWith("/api/");
  const PUBLIC_API_ROUTES = ["/api/v1/auth/login", "/api/v1/auth/refresh"];
  
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Helper functions
  const sendUnauthorized = () => {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Token inválido o expirado." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    // Prevent infinite loops on /login
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  };

  const sendForbidden = () => {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tiene permisos." }, timestamp: new Date().toISOString() },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  };

  // 2. Extract Token
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return sendUnauthorized();
  }

  // 3. Verify Token
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = String(payload.role || "").toUpperCase();

    // Redirección desde /login o /dashboard a la página principal según el rol
    if (pathname === "/login" || pathname === "/dashboard" || pathname === "/") {
      if (userRole === "ADMIN" || userRole === "DIRECTOR") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      if (userRole === "TUTOR") return NextResponse.redirect(new URL("/dashboard/tutor", request.url));
      if (userRole === "STUDENT") return NextResponse.redirect(new URL("/student/portal", request.url));
    }

    // RBAC para Vistas de Interfaz
    if (!isApiRoute) {
      if (userRole === "STUDENT" && !pathname.startsWith("/student/portal")) {
        return NextResponse.redirect(new URL("/student/portal", request.url));
      }
      if (userRole === "TUTOR" && pathname.startsWith("/dashboard/admin")) {
        return NextResponse.redirect(new URL("/dashboard/tutor", request.url));
      }
    }

    // RBAC para API Routes
    if (userRole !== "ADMIN" && userRole !== "DIRECTOR" && ADMIN_ONLY_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      return sendForbidden();
    }

    if (userRole === "TUTOR" && TUTOR_EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      return sendForbidden();
    }

    if (userRole === "DIRECTOR" && DIRECTOR_EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      return sendForbidden();
    }

    // Attach headers
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);
    response.headers.set("x-user-role", userRole);
    return response;
  } catch (error) {
    return sendUnauthorized();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
