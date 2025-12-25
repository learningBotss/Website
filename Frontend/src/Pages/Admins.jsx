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
import { ArrowLeft, Plus, Pencil, Trash2, Users, FileQuestion, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion, getAllUsers, getAllResults } from "../api";

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
  const [formData, setFormData] = useState({ quiz_type: "qualify", question_text: "" });

  // --- Fetch all data ---
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

  // --- Save / Create Question ---
  const handleSaveQuestion = async () => {
    if (!formData.question_text) {
      toast({ title: "Question text required", variant: "destructive" });
      return;
    }

    try {
      const defaultOptions = {
        qualify: [
          { value: 1, label: "Rarely" },
          { value: 2, label: "Sometimes" },
          { value: 3, label: "Often" },
        ],
        dyslexia: [
          { value: 1, label: "Never" },
          { value: 2, label: "Sometimes" },
          { value: 3, label: "Often" },
          { value: 4, label: "Always" },
        ],
        dysgraphia: [
          { value: 1, label: "Never" },
          { value: 2, label: "Sometimes" },
          { value: 3, label: "Often" },
          { value: 4, label: "Always" },
        ],
        dyscalculia: [
          { value: 1, label: "Never" },
          { value: 2, label: "Sometimes" },
          { value: 3, label: "Often" },
          { value: 4, label: "Always" },
        ],
      };

      const payload = {
        quiz_type: formData.quiz_type,
        text: formData.question_text,
        options: defaultOptions[formData.quiz_type] || [],
      };

      let data;
      if (editingQuestion) {
        data = await updateQuestion(editingQuestion.id, payload);
        setQuestions(prev => prev.map(q => (q.id === data.id ? data : q)));
      } else {
        data = await createQuestion(payload);
        setQuestions(prev => [...prev, data]);
      }

      toast({ title: "Saved successfully" });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      setFormData({ quiz_type: "qualify", question_text: "" });
    } catch (err) {
      console.error(err);
      toast({ title: err.message || "Failed to save question", variant: "destructive" });
    }
  };

  // --- Delete Question ---
  const handleDeleteQuestion = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({ title: "Deleted successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  const openEditDialog = (question) => {
    setEditingQuestion(question);
    setFormData({ quiz_type: question.quiz_type, question_text: question.text });
    setIsDialogOpen(true);
  };

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
            <TabsTrigger value="questions">
              <FileQuestion className="mr-2 h-4 w-4" />Questions
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Questions</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingQuestion(null);
                        setFormData({ quiz_type: "qualify", question_text: "" });
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingQuestion ? "Edit" : "Add"} Question</DialogTitle>
                      <DialogDescription>Fill in the question details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Quiz Type</Label>
                        <Select
                          value={formData.quiz_type}
                          onValueChange={(v) => setFormData({ ...formData, quiz_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualify">Qualify Quiz</SelectItem>
                            <SelectItem value="dyslexia">Dyslexia</SelectItem>
                            <SelectItem value="dysgraphia">Dysgraphia</SelectItem>
                            <SelectItem value="dyscalculia">Dyscalculia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          placeholder="Enter your question"
                          value={formData.question_text}
                          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                        />
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                        <p className="font-medium">Answer Options (Fixed)</p>
                        <p>Qualify/Dyslexia/Dysgraphia/Dyscalculia:</p>
                        <p> Never • Sometimes • Often • Always</p>
                      </div>
                      <Button onClick={handleSaveQuestion} className="w-full">
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={`${q.quiz_type}-${q.id}`}>
                        <TableCell className="capitalize">{q.quiz_type}</TableCell>
                        <TableCell className="max-w-md truncate">{q.text}</TableCell>
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
                    {users.map((u) => (
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
                    {results.map((r) => (
                      <TableRow key={r.quiz_id || r.id}>
                        <TableCell>{users.find(u => u.id === r.user_id)?.full_name || "-"}</TableCell>
                        <TableCell className="capitalize">{r.type || r.quiz_type}</TableCell>
                        <TableCell>{r.percentage ? `${r.percentage}%` : "-"}</TableCell>
                        <TableCell>{r.passed !== undefined ? (r.passed ? "Pass" : "Fail") : "-"}</TableCell>
                        <TableCell>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
