"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  AlertTriangle, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Función para cargar métricas según el rol
const cargarMetricas = async (userId, rol) => {
  try {
    return new Promise(resolve => {
      setTimeout(() => {
        const metricas = {
          admin: {
            estudiantes: { total: 450, nuevos: 12, tendencia: 2.5 },
 