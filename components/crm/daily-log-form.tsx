"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, User, Calendar, Clock, Phone, Users, TrendingUp, Star, Smile, Heart, MessageSquare, Save, CheckCircle, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DailyLog, SalesAgent } from "@/lib/types";

type DailyLogFormProps = {
  agents: SalesAgent[];
  onSubmit: (log: Partial<DailyLog>) => Promise<void>;
  initialLog?: Partial<DailyLog>;
};

export function DailyLogForm({
  agents,
  onSubmit,
  initialLog,
}: DailyLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DailyLog>>({
    agent_id: initialLog?.agent_id || "",
    log_date: initialLog?.log_date || new Date().toISOString().split("T")[0],
    check_in: initialLog?.check_in || "",
    check_out: initialLog?.check_out || "",
    calls_count: initialLog?.calls_count || 0,
    leads_count: initialLog?.leads_count || 0,
    meetings_count: initialLog?.meetings_count || 0,
    sales_amount: initialLog?.sales_amount || 0,
    appearance_score: initialLog?.appearance_score || 5,
    ethics_score: initialLog?.ethics_score || 5,
    notes: initialLog?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form if it's a new log
      if (!initialLog) {
        setFormData({
          agent_id: "",
          log_date: new Date().toISOString().split("T")[0],
          check_in: "",
          check_out: "",
          calls_count: 0,
          leads_count: 0,
          meetings_count: 0,
          sales_amount: 0,
          appearance_score: 5,
          ethics_score: 5,
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error saving log:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeAgents = agents.filter((a) => a.is_active);

  // Helper to get emoji for score
  const getScoreEmoji = (score: number) => {
    if (score >= 9) return "🌟";
    if (score >= 7) return "😊";
    if (score >= 5) return "😐";
    if (score >= 3) return "😕";
    return "😢";
  };

  // Calculate progress
  const calculateProgress = () => {
    let filled = 0;
    const total = 7; // agent, date, check_in, check_out, calls, meetings, sales
    
    if (formData.agent_id) filled++;
    if (formData.log_date) filled++;
    if (formData.check_in) filled++;
    if (formData.check_out) filled++;
    if ((formData.calls_count || 0) > 0) filled++;
    if ((formData.meetings_count || 0) > 0) filled++;
    if ((formData.sales_amount || 0) > 0) filled++;
    
    return Math.round((filled / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-2xl">Daily Log Entry</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the boxes below - it's easy! 
                </p>
              </div>
            </div>
            {progress > 0 && (
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{progress}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Who & When */}
            <motion.div 
              className="p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Step 1: Who is this for?</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent_id" className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pick the person *
                  </Label>
                  <Select
                    value={formData.agent_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, agent_id: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Click here to choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="text-base">
                          {agent.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log_date" className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    What day? *
                  </Label>
                  <Input
                    type="date"
                    id="log_date"
                    value={formData.log_date}
                    onChange={(e) =>
                      setFormData({ ...formData, log_date: e.target.value })
                    }
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* STEP 2: Time */}
            <motion.div 
              className="p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Step 2: What time?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                When did they arrive and leave?
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check_in" className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Arrived at (Check In)
                  </Label>
                  <Input
                    type="time"
                    id="check_in"
                    value={formData.check_in || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, check_in: e.target.value })
                    }
                    className="h-12 text-base"
                    placeholder="09:30"
                  />
                  <p className="text-xs text-muted-foreground">Example: 09:30 AM</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out" className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Left at (Check Out)
                  </Label>
                  <Input
                    type="time"
                    id="check_out"
                    value={formData.check_out || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, check_out: e.target.value })
                    }
                    className="h-12 text-base"
                    placeholder="18:30"
                  />
                  <p className="text-xs text-muted-foreground">Example: 06:30 PM</p>
                </div>
              </div>
            </motion.div>

            {/* STEP 3: What did they do? */}
            <motion.div 
              className="p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Step 3: What did they do today?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Count how many of each activity they completed
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="calls_count" className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Calls
                  </Label>
                  <Input
                    type="number"
                    id="calls_count"
                    min="0"
                    value={formData.calls_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calls_count: parseInt(e.target.value) || 0,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    className="h-12 text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">How many calls did they make?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetings_count" className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Meetings
                  </Label>
                  <Input
                    type="number"
                    id="meetings_count"
                    min="0"
                    value={formData.meetings_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetings_count: parseInt(e.target.value) || 0,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    className="h-12 text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">How many meetings?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sales_amount" className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Deal (EGP)
                  </Label>
                  <Input
                    type="number"
                    id="sales_amount"
                    min="0"
                    step="0.01"
                    value={formData.sales_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sales_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    className="h-12 text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Total sales in Egyptian Pounds</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="leads_count" className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Leads
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-xs font-medium text-yellow-700 dark:text-yellow-300 cursor-help">
                            <Info className="h-3 w-3 inline" /> Just for info
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This is just to keep track!<br />
                            It won't affect the score
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    type="number"
                    id="leads_count"
                    min="0"
                    value={formData.leads_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leads_count: parseInt(e.target.value) || 0,
                      })
                    }
                    onFocus={(e) => e.target.select()}
                    className="h-12 text-lg font-semibold"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">New potential customers</p>
                </div>
              </div>
            </motion.div>

            {/* STEP 4: How did they do? */}
            <motion.div 
              className="p-6 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-pink-500 text-white">
                  <Smile className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Step 4: Rate their behavior ⭐</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Give a score from 0 (bad) to 10 (awesome!)
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="appearance_score" className="text-base flex items-center gap-2">
                    👔 How did they look?
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="range"
                      id="appearance_score"
                      min="0"
                      max="10"
                      value={formData.appearance_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appearance_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1"
                    />
                    <div className="text-3xl min-w-[100px] text-center">
                      {getScoreEmoji(formData.appearance_score || 0)}
                      <div className="text-2xl font-bold text-pink-600">
                        {formData.appearance_score}/10
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Were they dressed well and professional?
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ethics_score" className="text-base flex items-center gap-2">
                    💚 How did they behave?
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="range"
                      id="ethics_score"
                      min="0"
                      max="10"
                      value={formData.ethics_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ethics_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1"
                    />
                    <div className="text-3xl min-w-[100px] text-center">
                      {getScoreEmoji(formData.ethics_score || 0)}
                      <div className="text-2xl font-bold text-pink-600">
                        {formData.ethics_score}/10
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Were they honest, kind, and respectful?
                  </p>
                </div>
              </div>
            </motion.div>

            {/* STEP 5: Any notes? */}
            <motion.div 
              className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-950/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gray-500 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Step 5: Anything else?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                (This part is optional - you can skip it if you want!)
              </p>
              
              <div className="space-y-2">
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:border-gray-400"
                  placeholder="Write anything special that happened today... (optional)"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </motion.div>

            {/* Submit Button - BIG and FRIENDLY */}
            <motion.div 
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {progress === 100 && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  Great job! All set to save!
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                size="lg"
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-6 w-6" />
                    Save This Log!
                  </>
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Click the big green button when you're ready!
              </p>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}



