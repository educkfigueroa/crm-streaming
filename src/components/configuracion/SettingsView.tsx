import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotificationSettings } from "./NotificationSettings";
import { DataSettings } from "./DataSettings";

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Personaliza la apariencia y las preferencias del CRM
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Modo claro/oscuro y paleta de color de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Avisos push cuando una suscripción esté por vencer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
          <CardDescription>
            Respaldo de tu información y restablecimiento de preferencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataSettings />
        </CardContent>
      </Card>
    </div>
  );
}
