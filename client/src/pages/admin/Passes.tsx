import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GuestPass, InsertGuestPass } from "@shared/schema";
import { CreditCard, Plus, Trash2, Loader2, QrCode, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Passes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertGuestPass>({
    passNumber: "",
    qrCode: "",
    isAvailable: true,
  });

  const { data: passes = [], isLoading } = useQuery<GuestPass[]>({
    queryKey: ["/api/guest-passes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGuestPass) => {
      const res = await apiRequest("POST", "/api/guest-passes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Guest pass created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-passes"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create pass", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/guest-passes/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Guest pass deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-passes"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete pass", description: error.message, variant: "destructive" });
    },
  });

  const generateBulkMutation = useMutation({
    mutationFn: async (count: number) => {
      const res = await apiRequest("POST", "/api/guest-passes/generate", { count });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.count} guest passes generated successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-passes"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate passes", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ passNumber: "", qrCode: "", isAvailable: true });
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    const qrCode = formData.qrCode || formData.passNumber;
    createMutation.mutate({ ...formData, qrCode });
  };

  const availableCount = passes.filter((p) => p.isAvailable).length;
  const inUseCount = passes.filter((p) => !p.isAvailable).length;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Guest Passes</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => generateBulkMutation.mutate(10)} disabled={generateBulkMutation.isPending} data-testid="button-generate-passes">
              {generateBulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate 10 Passes
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-pass">
                  <Plus className="h-4 w-4" />
                  Add Pass
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Guest Pass</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="passNumber">Pass Number</Label>
                    <Input id="passNumber" value={formData.passNumber} onChange={(e) => setFormData({ ...formData, passNumber: e.target.value })} placeholder="e.g., V001" className="mt-1" data-testid="input-pass-number" />
                  </div>
                  <div>
                    <Label htmlFor="qrCode">QR Code Value (optional)</Label>
                    <Input id="qrCode" value={formData.qrCode} onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })} placeholder="Leave empty to use pass number" className="mt-1" data-testid="input-qr-code" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || !formData.passNumber} data-testid="button-save-pass">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" data-testid="text-total-passes">{passes.length}</p>
              <p className="text-sm text-muted-foreground">Total Passes</p>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600" data-testid="text-available-passes">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600" data-testid="text-in-use-passes">{inUseCount}</p>
              <p className="text-sm text-muted-foreground">In Use</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Manage Guest Passes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : passes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No guest passes yet. Generate or add passes above.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass Number</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passes.map((pass) => (
                    <TableRow key={pass.id} data-testid={`row-pass-${pass.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-medium">{pass.passNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{pass.qrCode}</TableCell>
                      <TableCell>
                        {pass.isAvailable ? (
                          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <XCircle className="h-3 w-3" />
                            In Use
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(pass.id)} disabled={!pass.isAvailable} data-testid={`button-delete-${pass.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Guest Pass?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
