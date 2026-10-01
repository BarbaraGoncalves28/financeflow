import cron from "node-cron";

import { runNotificationChecks } from "../modules/notifications/notification-check.service.js";

export function startNotificationsJob(){
    cron.schedule("*/5 * * * *", async () => {
        try{
            await runNotificationChecks();

            console.log(
                "[Notifications] Verificação automática concluída.",
            );
        } catch (error) {
            console.log(
                "[Notifications] Erro ao verificar notificações:",
                error,
            );
        }
    });

    console.log(
        "[Notifications] Scheduler iniciado. Verificação a cada 5 minutos.",
    );
}

