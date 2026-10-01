import { useCallback, useEffect, useState } from "react";

import {
  getDashboardCashFlow,
  getDashboardInsights,
  getDashboardOverview,
  getDashboardSummary,
  type DashboardCashFlowResponse,
  type DashboardInsightsResponse,
  type DashboardOverviewResponse,
  type DashboardSummaryResponse,
} from "../services/dashboard";

interface DashboardData {
  summary: DashboardSummaryResponse | null;
  overview: DashboardOverviewResponse | null;
  cashFlow: DashboardCashFlowResponse | null;
  insights: DashboardInsightsResponse | null;
}

interface UseDashboardResult {
  data: DashboardData;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] =
    useState<DashboardData>({
      summary: null,
      overview: null,
      cashFlow: null,
      insights: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async () => {
      try {
        setError(null);

        const summary =
          await getDashboardSummary();

        setData((current) => ({
          ...current,
          summary,
        }));

        const [
          overview,
          cashFlow,
          insights,
        ] = await Promise.all([
          getDashboardOverview(),
          getDashboardCashFlow(),
          getDashboardInsights(),
        ]);

        setData({
          summary,
          overview,
          cashFlow,
          insights,
        });
      } catch (err) {
        console.error(
          "Erro ao carregar Dashboard:",
          err,
        );

        setError(
          "Não foi possível carregar os dados do Dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const refreshDashboard =
    useCallback(async () => {
      setRefreshing(true);

      await loadDashboard();
    }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    refreshing,
    error,
    loadDashboard,
    refreshDashboard,
  };
}