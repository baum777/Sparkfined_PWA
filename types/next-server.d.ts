declare module "next/server" {
  export class NextResponse {
    static next(): NextResponse;
    static redirect(url: URL): NextResponse;
  }

  export interface NextRequest {
    nextUrl: URL;
    url: string;
    cookies: {
      get(name: string): { value?: string } | undefined;
    };
  }
}
