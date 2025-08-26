"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Key,
  Settings,
  Shield,
  User,
  UserCircle,
  Calendar,
  Mail,
  Edit,
  Globe,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  History,
  Trash2,
  Save,
  RefreshCw,
  Lock,
  Camera,
  Check,
  X,
} from "lucide-react"
import DeleteAccountModal from "./DeleteAccountModal"

const MyAccount = () => {
  const { toast } = useToast()
  const { data, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")

  // Estados para preferencias
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [language, setLanguage] = useState("es")

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }
    if (data && data.user) {
      setUserData(data.user)
      setEditedName(data.user.name || "")
      setIsLoading(false)
    } else {
      toast({
        title: "No se pudo obtener la información del usuario",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }, [data, status, toast])

  // Función para calcular la fortaleza de la contraseña
  const calculatePasswordStrength = (password) => {
    if (!password) return 0

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    return strength
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`)
      }

      const data = await res.json()
      if (data.success) {
        toast({
          title: "¡Contraseña actualizada!",
          description: "Tu contraseña ha sido cambiada con éxito",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordStrength(0)
      } else {
        toast({
          title: data.error || "Error al cambiar contraseña",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error en cambio de contraseña:", err)
      toast({
        title: "Error de red al cambiar la contraseña",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewPasswordChange = (e) => {
    const value = e.target.value
    setNewPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
  }

  const handlePreferenceChange = (preference, value) => {
    switch (preference) {
      case "darkMode":
        setDarkMode(value)
        toast({
          title: value ? "Modo oscuro activado" : "Modo oscuro desactivado",
          description: "Tu preferencia ha sido guardada",
        })
        break
      case "emailNotifications":
        setEmailNotifications(value)
        toast({
          title: value ? "Notificaciones activadas" : "Notificaciones desactivadas",
          description: "Tu preferencia ha sido guardada",
        })
        break
      case "loginAlerts":
        setLoginAlerts(value)
        toast({
          title: value ? "Alertas activadas" : "Alertas desactivadas",
          description: "Tu preferencia ha sido guardada",
        })
        break
      case "language":
        setLanguage(value)
        toast({
          title: `Idioma cambiado a ${value === "es" ? "Español" : "Inglés"}`,
          description: "Tu preferencia ha sido guardada",
        })
        break
      default:
        break
    }
  }

  const handleNameEdit = () => {
    if (isEditing) {
      // Guardar cambios
      setUserData({ ...userData, name: editedName })
      toast({
        title: "Nombre actualizado",
        description: "Tu nombre ha sido actualizado correctamente",
      })
    }
    setIsEditing(!isEditing)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Débil"
    if (passwordStrength <= 3) return "Media"
    return "Fuerte"
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!userData) {
    return <ErrorState />
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header mejorado */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-200/50 dark:border-blue-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5" />
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={userData.image || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {userData.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ¡Hola, {userData.name?.split(" ")[0] || "Usuario"}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">Gestiona tu cuenta y preferencias desde aquí</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {userData.role || "Usuario"}
                </Badge>
                <Badge variant={userData.emailVerified ? "default" : "destructive"} className="flex items-center gap-1">
                  {userData.emailVerified ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {userData.emailVerified ? "Verificado" : "Sin verificar"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <DeleteAccountModal
            userId={userData.id}
            userEmail={userData.email}
            onClose={() => setShowDeleteModal(false)}
          />
        )}

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50">
            <TabsTrigger value="perfil" className="flex items-center gap-2 data-[state=active]:bg-background">
              <User size={18} />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield size={18} />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Settings size={18} />
              <span className="hidden sm:inline">Preferencias</span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <ProfileSection
              userData={userData}
              isEditing={isEditing}
              editedName={editedName}
              setEditedName={setEditedName}
              handleNameEdit={handleNameEdit}
            />
          </TabsContent>

          {/* Pestaña Seguridad */}
          <TabsContent value="seguridad" className="space-y-6">
            <PasswordSection
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              handleNewPasswordChange={handleNewPasswordChange}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordStrength={passwordStrength}
              getPasswordStrengthColor={getPasswordStrengthColor}
              getPasswordStrengthText={getPasswordStrengthText}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              handlePasswordChange={handlePasswordChange}
              loading={loading}
            />
            <SecuritySection setShowDeleteModal={setShowDeleteModal} />
          </TabsContent>

          {/* Pestaña Preferencias */}
          <TabsContent value="preferencias" className="space-y-6">
            <PreferencesSection
              darkMode={darkMode}
              emailNotifications={emailNotifications}
              loginAlerts={loginAlerts}
              language={language}
              handlePreferenceChange={handlePreferenceChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

// Componentes separados para mejor organización
const LoadingState = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <div className="space-y-2">
        <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto"></div>
        <div className="h-3 w-36 bg-muted/70 animate-pulse rounded mx-auto"></div>
      </div>
    </div>
  </div>
)

const ErrorState = () => (
  <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center text-destructive">
    <div className="text-center space-y-2">
      <AlertCircle className="h-12 w-12 mx-auto" />
      <h3 className="text-lg font-semibold">Error al cargar</h3>
      <p>No se pudo cargar la información del usuario</p>
    </div>
  </div>
)

const ProfileSection = ({ userData, isEditing, editedName, setEditedName, handleNameEdit }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Información Personal */}
    <Card className="lg:col-span-2 border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Información Personal
        </CardTitle>
        <CardDescription>Gestiona tu información básica de perfil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={isEditing ? editedName : userData.name || ""}
                onChange={(e) => setEditedName(e.target.value)}
                readOnly={!isEditing}
                className={`transition-all duration-200 ${
                  isEditing ? "ring-2 ring-blue-500/20 bg-background" : "bg-muted/50"
                }`}
              />
              <Button variant="outline" size="icon" onClick={handleNameEdit}>
                {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={userData.email || ""} readOnly className="bg-muted/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Miembro desde</p>
              <p className="text-xs text-muted-foreground">
                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "No disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Estado del email</p>
              <p className="text-xs text-muted-foreground">{userData.emailVerified ? "Verificado" : "No verificado"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Estadísticas rápidas */}
    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          Estado de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Verificación de email</span>
            {userData.emailVerified ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Autenticación 2FA</span>
            <X className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Contraseña segura</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Nivel de seguridad</span>
            <span className="font-medium">Medio</span>
          </div>
          <Progress value={60} className="h-2" />
          <p className="text-xs text-muted-foreground">Activa 2FA para mejorar tu seguridad</p>
        </div>
      </CardContent>
    </Card>
  </div>
)

const PasswordSection = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  handleNewPasswordChange,
  confirmPassword,
  setConfirmPassword,
  passwordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handlePasswordChange,
  loading,
}) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        Cambiar Contraseña
      </CardTitle>
      <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current-password">Contraseña actual</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
                minLength={6}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {newPassword && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Fortaleza:</span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength <= 1
                        ? "text-red-600"
                        : passwordStrength <= 3
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <Progress value={(passwordStrength / 5) * 100} className="h-2" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tu contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Cambiar contraseña
              </>
            )}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
)

const SecuritySection = ({ setShowDeleteModal }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Seguridad Adicional
      </CardTitle>
      <CardDescription>Opciones adicionales para proteger tu cuenta</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <SecurityOption
          icon={<Smartphone className="h-4 w-4" />}
          title="Autenticación de dos factores"
          description="Añade una capa extra de seguridad a tu cuenta"
          action="Configurar"
          variant="outline"
        />

        <SecurityOption
          icon={<History className="h-4 w-4" />}
          title="Sesiones activas"
          description="Gestiona los dispositivos conectados a tu cuenta"
          action="Ver sesiones"
          variant="outline"
        />

        <SecurityOption
          icon={<Lock className="h-4 w-4" />}
          title="Historial de acceso"
          description="Revisa los inicios de sesión recientes"
          action="Ver historial"
          variant="outline"
        />

        <Separator />

        <div className="flex justify-between items-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-destructive">Eliminar cuenta</h3>
              <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

const SecurityOption = ({ icon, title, description, action, variant = "outline" }) => (
  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border border-border/50">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">{icon}</div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Button variant={variant} size="sm">
      {action}
    </Button>
  </div>
)

const PreferencesSection = ({ darkMode, emailNotifications, loginAlerts, language, handlePreferenceChange }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
        Preferencias de Usuario
      </CardTitle>
      <CardDescription>Personaliza tu experiencia en el sistema</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <PreferenceToggle
          id="dark-mode"
          icon={<Settings className="h-4 w-4" />}
          title="Modo oscuro"
          description="Activa el tema oscuro para reducir la fatiga visual"
          checked={darkMode}
          onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
        />

        <PreferenceToggle
          id="email-notifications"
          icon={<Bell className="h-4 w-4" />}
          title="Notificaciones por correo"
          description="Recibe actualizaciones importantes por correo electrónico"
          checked={emailNotifications}
          onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
        />

        <PreferenceToggle
          id="login-alerts"
          icon={<Shield className="h-4 w-4" />}
          title="Alertas de inicio de sesión"
          description="Recibe alertas cuando se detecte un inicio de sesión nuevo"
          checked={loginAlerts}
          onCheckedChange={(checked) => handlePreferenceChange("loginAlerts", checked)}
        />

        <Separator />

        <div className="space-y-3">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma
          </Label>
          <select
            id="language"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={language}
            onChange={(e) => handlePreferenceChange("language", e.target.value)}
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 Inglés</option>
          </select>
        </div>
      </div>
    </CardContent>
  </Card>
)

const PreferenceToggle = ({ id, icon, title, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">{icon}</div>
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
)

export default MyAccount
