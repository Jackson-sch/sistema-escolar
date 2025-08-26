"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, Bell, CheckCircle2, Key, LogOut, Settings, 
  Shield, User, UserCircle, Calendar, Mail, Edit, Globe 
} from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";

const MyAccount = () => {
  const { toast } = useToast();
  const { data, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados para preferencias
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (data && data.user) {
      setUserData(data.user);
      setIsLoading(false);
    } else {
      toast({
        title: "No se pudo obtener la información del usuario",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [data, status, toast]);

  // Función para calcular la fortaleza de la contraseña
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    // Longitud
    if (password.length >= 8) strength += 1;
    // Contiene números
    if (/\d/.test(password)) strength += 1;
    // Contiene letras minúsculas
    if (/[a-z]/.test(password)) strength += 1;
    // Contiene letras mayúsculas
    if (/[A-Z]/.test(password)) strength += 1;
    // Contiene caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        toast({ 
          title: "Contraseña actualizada correctamente",
          description: "Tu contraseña ha sido cambiada con éxito",
          variant: "success"
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
      } else {
        toast({
          title: data.error || "Error al cambiar contraseña",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error en cambio de contraseña:", err);
      toast({
        title: "Error de red al cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio de contraseña
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };
  
  // Función para manejar el cambio de preferencias
  const handlePreferenceChange = (preference, value) => {
    switch (preference) {
      case 'darkMode':
        setDarkMode(value);
        toast({ 
          title: value ? "Modo oscuro activado" : "Modo oscuro desactivado",
          description: "Tu preferencia ha sido guardada",
        });
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        toast({ 
          title: value ? "Notificaciones por email activadas" : "Notificaciones por email desactivadas",
          description: "Tu preferencia ha sido guardada",
        });
        break;
      case 'loginAlerts':
        setLoginAlerts(value);
        toast({ 
          title: value ? "Alertas de inicio de sesión activadas" : "Alertas de inicio de sesión desactivadas",
          description: "Tu preferencia ha sido guardada",
        });
        break;
      case 'language':
        setLanguage(value);
        toast({ 
          title: `Idioma cambiado a ${value === "es" ? "Español" : "Inglés"}`,
          description: "Tu preferencia ha sido guardada",
        });
        break;
      default:
        break;
    }
  };

  // Función para renderizar el indicador de fortaleza de contraseña
  const renderPasswordStrengthIndicator = () => {
    const getColorClass = () => {
      if (passwordStrength <= 1) return "bg-red-500";
      if (passwordStrength <= 3) return "bg-yellow-500";
      return "bg-green-500";
    };

    const getStrengthText = () => {
      if (passwordStrength <= 1) return "Débil";
      if (passwordStrength <= 3) return "Media";
      return "Fuerte";
    };

    if (!newPassword) return null;

    return (
      <div className="mt-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Fortaleza:</span>
          <span className={`text-xs ${
            passwordStrength <= 1 ? "text-red-500" : 
            passwordStrength <= 3 ? "text-yellow-500" : "text-green-500"
          }`}>{getStrengthText()}</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass()}`} 
            style={{ width: `${(passwordStrength / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-48 bg-blue-100 rounded mb-2"></div>
          <div className="h-3 w-36 bg-blue-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-700">
        <AlertCircle className="mr-2" />
        No se pudo cargar la información del usuario
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Cuenta</h1>
        <p className="text-gray-600">
          Administra tu información personal y seguridad
        </p>
      </header>
      
      {showDeleteModal && (
        <DeleteAccountModal 
          userId={userData.id} 
          userEmail={userData.email} 
          onClose={() => setShowDeleteModal(false)}
        />
      )}
      
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User size={16} />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Shield size={16} />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="flex items-center gap-2">
            <Settings size={16} />
            Preferencias
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de la pestaña Perfil */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                Información de Perfil
              </CardTitle>
              <CardDescription>
                Visualiza y actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar y datos básicos */}
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {userData.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {userData.name || "Usuario"}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      {userData.email || "Sin correo"}
                    </p>
                    <Badge className="mt-2" variant="outline">
                      {userData.role || "Usuario"}
                    </Badge>
                  </div>
                </div>
                
                {/* Información detallada */}
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Información Personal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <div className="flex mt-1">
                          <Input 
                            id="name"
                            value={userData.name || ""}
                            className="rounded-r-none"
                            readOnly
                          />
                          <Button variant="outline" size="icon" className="rounded-l-none">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input 
                          id="email"
                          value={userData.email || ""}
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Miembro desde: {
                          userData.createdAt 
                            ? new Date(userData.createdAt).toLocaleDateString() 
                            : "No disponible"
                        }</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {userData.emailVerified ? "Email verificado" : "Email no verificado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la pestaña Seguridad */}
        <TabsContent value="seguridad">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-500" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      required
                      minLength={6}
                    />
                    {renderPasswordStrengthIndicator()}
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Actualizando...
                      </>
                    ) : "Cambiar contraseña"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Seguridad Adicional
              </CardTitle>
              <CardDescription>
                Opciones adicionales para proteger tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Autenticación de dos factores</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Añade una capa extra de seguridad a tu cuenta
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Sesiones activas</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Gestiona los dispositivos conectados a tu cuenta
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Ver sesiones</Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Historial de acceso</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Revisa los inicios de sesión recientes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Ver historial</Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-red-600">Eliminar cuenta</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la pestaña Preferencias */}
        <TabsContent value="preferencias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Preferencias de Usuario
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Modo oscuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa el tema oscuro para reducir la fatiga visual
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificaciones por correo</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-alerts">Alertas de inicio de sesión</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe alertas cuando se detecte un inicio de sesión nuevo
                    </p>
                  </div>
                  <Switch
                    id="login-alerts"
                    checked={loginAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('loginAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <select
                      id="language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyAccount;
