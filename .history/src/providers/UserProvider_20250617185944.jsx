"use client";
import { UserContext } from "@/context/UserContext";

export default function UserProvider({ user, children }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}