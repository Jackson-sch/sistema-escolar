"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  X, 
  Download,
  RefreshCw,
  Users,
  BookOpen,
  Calendar as CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/utils/utils";
import { useAsistenciaFilters } from "@/hooks/use-asistencia-filters";

export default function AsistenciasClient() {
  const {
    // Estado actual
    filters,
    currentTab,
    currentEstudiante,
    currentCurso,
    currentEstado,
    currentFechaInicio,
    currentFechaFin,
    currentPage,
    currentPageSize,
    
    // Setters
    setTab,
    setEstudiante,
    setCurso,
    setEstado,
    setFechaInicio,
    setFechaFin,
    setPage,
    
    // Utilidades
    resetFilters,
    hasActiveFilters,
    activeFiltersCount
  } = useAsistenciaFilters();

  // Estados locales para datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simular carga de datos basada en filtros
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)