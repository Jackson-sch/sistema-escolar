"use client";
import React, { useEffect, useState } from "react";
import { getUsers } from "./api";

export default function UserPage() {
/*   const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const users = await getUsers();
      setUsers(users);
    }
    fetchUsers();
  }, []); */

  return (
    <div>
      <h1>Users</h1>
      <div className="container mx-auto grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex gap-4 border border-gray-200 p-4"
          >
            <span className="font-bold border-r border-gray-200 pr-4">
              {user.name} {user.apellido}
            </span>
            <p className="border-r pr-4">{user.email}</p>
            <span className="">
              {new Date(user.fechaNacimiento).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const users = [
  {
    id: 1,
    name: "Juan",
    apellido: "Perez",
    email: "example@example.com",
    fechaNacimiento: "2021-10-10",
  },
  {
    id: 2,
    name: "Maria",
    apellido: "Gonzalez",
    email: "example2@example.com",
    fechaNacimiento: "2021-10-11",
  }
];