"use client";
import { GenericDataTable } from "@/components/DataTable/GenericTable";
import { columns } from "./columns";

export default function NotaTable({ notas }) {
  return <GenericDataTable columns={columns} data={notas} />;
}
