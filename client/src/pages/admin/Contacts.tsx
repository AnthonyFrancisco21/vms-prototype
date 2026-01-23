import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { StaffContact, InsertStaffContact } from "@shared/schema";
import { Users, Plus, Pencil, Trash2, Loader2, Phone, Mail } from "lucide-react";

export default function Contacts() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<StaffContact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertStaffContact>({
    name: "",
    department: "",
    mobileNumber: "",
    email: "",
    isActive: true,
  });

  const { data: contacts = [], isLoading } = useQuery<StaffContact[]>({
    queryKey: ["/api/staff-contacts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStaffContact) => {
      const res = await apiRequest("POST", "/api/staff-contacts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Contact created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-contacts"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create contact", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertStaffContact }) => {
      const res = await apiRequest("PATCH", `/api/staff-contacts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Contact updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-contacts"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update contact", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/staff-contacts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Contact deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-contacts"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete contact", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", department: "", mobileNumber: "", email: "", isActive: true });
    setEditingContact(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (contact: StaffContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      department: contact.department || "",
      mobileNumber: contact.mobileNumber,
      email: contact.email || "",
      isActive: contact.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
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
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Staff Contacts</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-contact">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" className="mt-1" data-testid="input-contact-name" />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={formData.department || ""} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., IT Department" className="mt-1" data-testid="input-contact-department" />
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input id="mobileNumber" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} placeholder="+1234567890" className="mt-1" data-testid="input-contact-mobile" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="mt-1" data-testid="input-contact-email" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} data-testid="switch-contact-active" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isPending || !formData.name || !formData.mobileNumber} data-testid="button-save-contact">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingContact ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Manage Staff Contacts for Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No contacts yet. Add your first contact above.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.department || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{contact.mobileNumber}</div>
                          {contact.email && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{contact.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${contact.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {contact.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(contact)} data-testid={`button-edit-${contact.id}`}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(contact.id)} data-testid={`button-delete-${contact.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
              <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
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
