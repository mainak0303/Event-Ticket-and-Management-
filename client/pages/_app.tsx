import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Cookies } from "react-cookie";
import Wrapper from "@/layout/wrapper";


export default function App ( { Component, pageProps }: AppProps )
{
  const queryClient = new QueryClient( {} );
  const router = useRouter();
  useEffect( () =>
  {
    const cookie = new Cookies();
    if ( cookie.get( "show_login_toast" ) )
    {
      toast.error( "Please login to access this content" );
      cookie.remove( "show_login_toast", { path: "/" } );
    }
  }, [ router.pathname ] );
  return (
    <QueryClientProvider client={ queryClient }>
      <Wrapper>
        <Toaster position="top-right" />
        <Component { ...pageProps } />
      </Wrapper>
    </QueryClientProvider>
  );
}

