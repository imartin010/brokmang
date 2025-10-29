"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History as HistoryIcon, Trash2, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";
import { BreakEvenRecord } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BreakEvenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      loadRecords();
    };

    checkUser();
  }, [router]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("break_even_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error loading records:", error);
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenario?")) return;

    try {
      const { error } = await supabase
        .from("break_even_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setRecords(records.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete scenario");
    }
  };

  const handleExportCSV = (record: BreakEvenRecord) => {
    const csv = [
      ["Metric", "Value"],
      ["Date", new Date(record.created_at).toLocaleString()],
      ["", ""],
      ["INPUTS", ""],
      ["Agents", record.inputs.agents],
      ["Team Leaders", record.inputs.team_leaders],
      ["Rent", record.inputs.rent],
      ["Salary", record.inputs.salary],
      ["Team Leader Share", record.inputs.team_leader_share],
      ["Others", record.inputs.others],
      ["Marketing", record.inputs.marketing],
      ["SIM", record.inputs.sim],
      ["Franchise Owner Salary", record.inputs.franchise_owner_salary],
      ["Gross Rate", `${(record.inputs.gross_rate * 100).toFixed(2)}%`],
      ["Agent Comm per 1M", record.inputs.agent_comm_per_1m],
      ["TL Comm per 1M", record.inputs.tl_comm_per_1m],
      ["Withholding", record.inputs.withholding],
      ["VAT", record.inputs.vat],
      ["Income Tax", record.inputs.income_tax],
      ["", ""],
      ["RESULTS", ""],
      ["Cost Per Seat", record.results.cost_per_seat],
      ["Total Operating Cost", record.results.total_operating_cost],
      ["Gross per 1M", record.results.gross_per_1m],
      ["Commissions per 1M", record.results.commissions_per_1m],
      ["Taxes per 1M", record.results.taxes_per_1m],
      ["Net Revenue per 1M", record.results.net_rev_per_1m],
      ["Break-Even Sales (EGP)", record.results.break_even_sales_egp],
      ["Break-Even Sales (Million)", record.results.break_even_sales_million],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `break-even-${record.id}.csv`;
    a.click();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
          Saved Scenarios
        </h1>
        <p className="text-muted-foreground">
          View, export, and manage your break-even analysis history
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading scenarios...</p>
          </div>
        </div>
      ) : records.length === 0 ? (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No Scenarios Yet</p>
            <p className="text-muted-foreground mb-4">
              Create and save your first break-even analysis
            </p>
            <Button onClick={() => router.push("/analyze")} className="gradient-bg">
              Start Analyzing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Scenario from{" "}
                        {new Date(record.created_at).toLocaleString()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.inputs.agents} Agents, {record.inputs.team_leaders}{" "}
                        Team Leaders
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleExportCSV(record)}
                        title="Export CSV"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Cost Per Seat
                      </p>
                      <p className="font-bold">
                        {formatCurrency(record.results.cost_per_seat)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Operating Cost
                      </p>
                      <p className="font-bold">
                        {formatCurrency(record.results.total_operating_cost)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Net Revenue Per 1M
                      </p>
                      <p className="font-bold">
                        {formatCurrency(record.results.net_rev_per_1m)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Break-Even Sales
                      </p>
                      <p className="font-bold">
                        {formatNumber(
                          record.results.break_even_sales_million,
                          2
                        )}
                        M
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(record.results.break_even_sales_egp)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

