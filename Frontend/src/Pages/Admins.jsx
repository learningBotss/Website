import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Pencil, Trash2, Users, FileQuestion, Loader2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  getAllResults,
  getSecondScreening,
  saveSecondScreeningConfig
} from "../api";

// Helper to calculate level
const getLevel = (percentage) => {
  if (percentage === null || percentage === undefined) return "-";
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Moderate";
  return "Low";
};

// ================== Second Screening Admin Component ==================
const SecondAssessmentAdmin = () => {
  const { toast } = useToast();

  const [allQuestions, setAllQuestions] = useState({});
  const [selected, setSelected] = useState({});
  const [threshold, setThreshold] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, configRes] = await Promise.all([
          getAllQuestions(),
          getSecondScreening()
        ]);

        // Group questions by quiz_type, ignore general
        const grouped = {};
        questionsRes.forEach(q => {
          if (q.quiz_type === "general") return;
          if (!grouped[q.quiz_type]) grouped[q.quiz_type] = [];
          grouped[q.quiz_type].push(q);
        });
        setAllQuestions(grouped);

        // Load config
        const cfg = configRes.data || configRes;
        setThreshold(cfg.threshold ?? 50);

        const initSelected = {};
          Object.keys(grouped).forEach(type => {
            const raw = cfg.questions?.[type] || [];
            initSelected[type] = raw
              .map(q => ({ id: typeof q === "object" ? q.id : q, type }))
              .filter(q => q.id);
          });
          setSelected(initSelected);

      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load second screening", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const toggleQuestion = (type, id) => {
  setSelected(prev => {
    const current = prev[type] || [];

    const exists = current.some(q => q.id === id);
    const updated = exists
      ? current.filter(q => q.id !== id)
      : [...current, { id, type }];

    return { ...prev, [type]: updated };
  });
};

  const saveConfig = async () => {
    try {
      const cleanQuestions = {};
      Object.keys(selected).forEach(type => {
        cleanQuestions[type] = (selected[type] || []).map(q => q.id); // simpan backend hanya id
      });

      await saveSecondScreeningConfig({ threshold, questions: cleanQuestions });
      toast({ title: "Second Assessment Config saved" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to save config", variant: "destructive" });
    }
  };


  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label>Threshold (%)</Label>
        <input
          type="number"
          min={0}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="input input-bordered w-24"
        />
      </div>

      {Object.keys(allQuestions).map(type => (
        <div key={type} className="rounded-lg border p-4">
          <h3 className="mb-2 font-bold capitalize">{type}</h3>
          {allQuestions[type].map(q => (
            <div key={q.id} className="flex items-start gap-2 py-1">
             <Checkbox
                checked={selected[type]?.some(sel => sel.id === q.id)}
                onCheckedChange={() => toggleQuestion(type, q.id)}
              />


              <div className="flex w-full justify-between">
                <span className="text-sm leading-snug">{q.text}</span>
                <span className="ml-3 shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {q.weight} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      <Button onClick={saveConfig}>Save Config</Button>
    </div>
  );
};

// ================== Main Admin Component ==================
const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ quiz_type: "general", question_text: "", weight: 4 });
  const [filterType, setFilterType] = useState("all");

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [qData, uData, rData] = await Promise.all([
          getAllQuestions(),
          getAllUsers(),
          getAllResults()
        ]);
        setQuestions(qData);
        setUsers(uData);
        setResults(rData);
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === "admin") fetchAll();
  }, [user, toast]);

 const generateOptions = (quiz_type, weight) => {
  const labels = ["Never", "Sometimes", "Often", "Always"];
  return labels.map((label, i) => {
    let score = 0; 
    if (label === "Never") score = 0;
    else score = Math.round(weight * i / (labels.length - 1) * 100) / 100;
    return {
      value: i + 1,
      label,
      score
    };
  });
};


  const handleSaveQuestion = async () => {
    if (!formData.question_text) {
      toast({ title: "Question text required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        text: formData.question_text,
        weight: formData.weight,
        options: generateOptions(formData.quiz_type, formData.weight)
      };

      let data;
      if (editingQuestion) {
        // update pakai id + quiz_type
        data = await updateQuestion(editingQuestion.id, formData.quiz_type, payload);

        setQuestions(prev => {
          const filtered = prev.filter(q => !(q.id === data.id && q.quiz_type === data.quiz_type));
          return [...filtered, data];
        });
      } else {
        data = await createQuestion({ ...payload, quiz_type: formData.quiz_type });

        setQuestions(prev => {
          const filtered = prev.filter(q => !(q.id === data.id && q.quiz_type === data.quiz_type));
          return [...filtered, data];
        });
      }

      toast({ title: "Saved successfully" });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      setFormData({ quiz_type: "general", question_text: "", weight: 4 });

    } catch (err) {
      console.error(err);
      toast({ title: err.message || "Failed to save question", variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id, quiz_type) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestion(id, quiz_type);
      setQuestions(prev => prev.filter(q => !(q.id === id && q.quiz_type === quiz_type)));
      toast({ title: "Deleted successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: err.message || "Failed to delete", variant: "destructive" });
    }
  };


  const openEditDialog = (q) => {
    setEditingQuestion(q);
    setFormData({ quiz_type: q.quiz_type, question_text: q.text, weight: q.weight });
    setIsDialogOpen(true);
  };

  const filteredQuestions = filterType === "all" ? questions : questions.filter(q => q.quiz_type === filterType);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

        <Tabs defaultValue="questions">
          <TabsList className="mb-6">
            <TabsTrigger value="questions"><FileQuestion className="mr-2 h-4 w-4" />Questions</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users ({users.length})</TabsTrigger>
            <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            <TabsTrigger value="second"><Settings className="mr-2 h-4 w-4" />Second Qualification</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Questions</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Filter Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="dyslexia">Dyslexia</SelectItem>
                      <SelectItem value="dysgraphia">Dysgraphia</SelectItem>
                      <SelectItem value="dyscalculia">Dyscalculia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingQuestion(null); setFormData({ quiz_type: "general", question_text: "", weight: 4 }); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingQuestion ? "Edit" : "Add"} Question</DialogTitle>
                        <DialogDescription>Fill in the question details below</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Label>Quiz Type</Label>
                        <Select value={formData.quiz_type} onValueChange={v => setFormData({ ...formData, quiz_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Quiz</SelectItem>
                            <SelectItem value="dyslexia">Dyslexia</SelectItem>
                            <SelectItem value="dysgraphia">Dysgraphia</SelectItem>
                            <SelectItem value="dyscalculia">Dyscalculia</SelectItem>
                          </SelectContent>
                        </Select>

                        <Label>Question Text</Label>
                        <Textarea value={formData.question_text} onChange={e => setFormData({ ...formData, question_text: e.target.value })} />

                        <Label>Weight (Total Marks)</Label>
                        <input type="number" min={1} value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })} className="input input-bordered w-full" />

                        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                          <p className="font-medium">Answer Options & Scores</p>
                          {generateOptions(formData.quiz_type, formData.weight).map(opt => <p key={opt.value}>{opt.label} = {opt.score} marks</p>)}
                        </div>

                        <Button onClick={handleSaveQuestion} className="w-full">Save</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map(q => (
                      <TableRow key={`${q.quiz_type}-${q.id}`}>
                        <TableCell className="capitalize">{q.quiz_type}</TableCell>
                        <TableCell className="max-w-md truncate">{q.text}</TableCell>
                        <TableCell>{q.weight || "-"}</TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(q)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.full_name || "-"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(r => (
                      <TableRow key={r.quiz_id || r.id}>
                        <TableCell>{users.find(u => u.id === r.user_id)?.full_name || "-"}</TableCell>
                        <TableCell className="capitalize">{r.type || r.quiz_type}</TableCell>
                        <TableCell>
                          {r.type === "Second Qualification" && typeof r.percentage === "object" ? (
                            <div className="space-y-1">
                              {Object.entries(r.percentage).map(([type, pct]) => (
                                <div key={type} className="text-xs capitalize">
                                  {type}: {Math.round(pct)}%
                                </div>
                              ))}
                            </div>
                          ) : r.percentage !== null && r.percentage !== undefined ? (
                            `${Math.round(r.percentage)}%`
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                         {/* FIRST QUALIFICATION */}
                          {r.type === "First Qualification" ? (
                            r.passed ? "Pass" : "Fail"

                          /* SECOND QUALIFICATION */
                          ) : r.type === "Second Qualification" && typeof r.percentage === "object" ? (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(r.percentage).map(([type, pct]) => {
                                const detected = pct >= 60;
                                return (
                                  <span
                                    key={type}
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                      detected
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {type}: {detected ? "Detected" : "Not Detected"}
                                  </span>
                                );
                              })}
                            </div>

                          /* OTHER QUIZ */
                          ) : (
                            <span
                              className={
                                getLevel(r.percentage) === "High"
                                  ? "text-success font-medium"
                                  : getLevel(r.percentage) === "Moderate"
                                  ? "text-warning font-medium"
                                  : "text-destructive font-medium"
                              }
                            >
                              {getLevel(r.percentage)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Second Screening Tab */}
          <TabsContent value="second">
            <SecondAssessmentAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
