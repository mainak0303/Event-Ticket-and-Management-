import { Cookies } from "react-cookie";
import toast from "react-hot-toast";
import { create } from "zustand";

const cookies = new Cookies();

interface User
{
  id: string;
  name: string;
  email: string;
  image: string;
}

interface UserState
{
  token: string | null;
  setToken: ( token: string | null, rememberMe?: boolean ) => void;
  user: User | null;
  setUser: ( user: User | null ) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>( ( set ) => ( {
  token: cookies.get( "token" ) || null,
  user:
    typeof window !== "undefined"
      ? JSON.parse( localStorage.getItem( "user" ) || "null" )
      : null,

  setToken: (token, rememberMe = false) => {
    if (token) {
      const expires = rememberMe ? 30 : 1; // 30 days or 1 day
      cookies.set("token", token, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: expires * 24 * 60 * 60, // Convert days to seconds
      });
    }
    set({ token });
  },

  setUser: ( user ) =>
  {
    if ( typeof window !== "undefined" )
    {
      if ( user )
      {
        localStorage.setItem( "user", JSON.stringify( user ) );
      } else
      {
        localStorage.removeItem( "user" );
      }
    }
    console.log( "User Updated:", user );
    set( { user } );
  },

  logout: () =>
  {
    cookies.remove( "token", { path: "/" } );
    localStorage.clear();
    set( { token: null, user: null } );
    toast.success( "Logout successful!" );
  },
} ) );

