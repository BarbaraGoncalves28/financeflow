import cron from "node-cron";
import { executeDueRecurringTransactions } from "../modules/recurring-transactions/recurring-transaction.service.js";

export function startRecurringTransactionsJob() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const results = await executeDueRecurringTransactions();

      if (results.length > 0) {
        console.log(
          `[RecurringTransactions] ${results.length} recorrência(s) processada(s).`,
        );
      }
    } catch (error) {
      console.error(
        "[RecurringTransactions] Erro ao processar recorrências:",
        error,
      );
    }
  });

  console.log(
    "[RecurringTransactions] Scheduler iniciado. Execução a cada 5 minutos.",
  );
}