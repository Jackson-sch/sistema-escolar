"use client";

import { useSession } from "next-auth/react";
import NotificacionesClient from "./components/NotificacionesClient";

const NotificacionesPage = () => {
  const { data: session } = useSession();

  return <NotificacionesClient />;
};

export default NotificacionesPage;
