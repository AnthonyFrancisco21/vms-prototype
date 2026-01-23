import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Destination, InsertDestination } from "@shared/schema";
import { Building2, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Destinations() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertDestination>({
    name: "",
    floor: "",
    description: "",
    isActive: true,
  });

  const { data: destinations = [], isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDestination) => {
      const res = await apiRequest("POST", "/api/destinations", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Destination created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create destination", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertDestination }) => {
      const res = await apiRequest("PATCH", `/api/destinations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Destination updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update destination", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/destinations/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Destination deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/destinations"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete destination", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", floor: "", description: "", isActive: true });
    setEditingDestination(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      floor: destination.floor || "",
      description: destination.description || "",
      isActive: destination.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingDestination) {
      updateMutation.mutate({ id: editingDestination.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Destinations</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-destination">
                <Plus className="h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDestination ? "Edit Destination" : "Add New Destination"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Human Resources"
                    className="mt-1"
                    data-testid="input-destination-name"
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor || ""}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 3rd Floor"
                    className="mt-1"
                    data-testid="input-destination-floor"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                    className="mt-1"
                    data-testid="input-destination-description"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="switch-destination-active"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isPending || !formData.name} data-testid="button-save-destination">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingDestination ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Manage Office Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No destinations yet. Add your first destination above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinations.map((dest) => (
                    <TableRow key={dest.id} data-testid={`row-destination-${dest.id}`}>
                      <TableCell className="font-medium">{dest.name}</TableCell>
                      <TableCell>{dest.floor || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{dest.description || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${dest.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {dest.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(dest)} data-testid={`button-edit-${dest.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(dest.id)} data-testid={`button-delete-${dest.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
              <AlertDialogTitle>Delete Destination?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the destination.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
