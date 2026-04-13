import React, { useEffect, useMemo, useState } from "react";

export type DashboardDay = {
  date: string;
  visitors: number;
  conversions: number;
  revenue: number;
};

export type SevenDayDashboardWidgetProps = {
  /** API endpoint that returns the most recent 7 days of dashboard data. */
  endpoint: string;
  /** Optional class name for custom host styling. */
  className?: string;
  /** Optional title override. */
  title?: string;
};

export function SevenDayDashboardWidget({
  endpoint,
  className,
  title = "7-Day Dashboard",
}: SevenDayDashboardWidgetProps) {
  const [rows, setRows] = useState<DashboardDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}?range=7d`);
        if (!response.ok) {
          throw new Error(`Dashboard request failed (${response.status})`);
        }

        const payload = (await response.json()) as { data?: DashboardDay[] };
        if (!active) return;

        const safeRows = Array.isArray(payload.data) ? payload.data : [];
        setRows(safeRows.slice(-7));
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Unable to load dashboard";
        setError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [endpoint]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.visitors += row.visitors;
        acc.conversions += row.conversions;
        acc.revenue += row.revenue;
        return acc;
      },
      { visitors: 0, conversions: 0, revenue: 0 }
    );
  }, [rows]);

  const conversionRate =
    totals.visitors > 0 ? `${((totals.conversions / totals.visitors) * 100).toFixed(1)}%` : "0.0%";

  return (
    <section
      className={className}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
      }}
      aria-busy={isLoading}
    >
      <header style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
          Most recent 7 days
        </p>
      </header>

      {isLoading ? (
        <p style={{ margin: 0 }}>Loading dashboard…</p>
      ) : error ? (
        <p style={{ margin: 0, color: "#b91c1c" }}>Error: {error}</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Metric label="Visitors" value={totals.visitors.toLocaleString()} />
            <Metric label="Conversions" value={totals.conversions.toLocaleString()} />
            <Metric label="Revenue" value={`$${totals.revenue.toLocaleString()}`} />
          </div>

          <p style={{ margin: "0 0 10px", color: "#374151", fontSize: 14 }}>
            7-day conversion rate: <strong>{conversionRate}</strong>
          </p>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {rows.map((row) => (
              <li
                key={row.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr auto",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <span>{formatDate(row.date)}</span>
                <span
                  style={{
                    display: "block",
                    height: 8,
                    borderRadius: 999,
                    background: "#dbeafe",
                    width: `${Math.min(100, Math.round((row.visitors / Math.max(1, totals.visitors)) * 100))}%`,
                  }}
                />
                <strong>{row.visitors.toLocaleString()} visitors</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #f3f4f6",
        borderRadius: 10,
        padding: 10,
        background: "#fafafa",
      }}
    >
      <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
