import { Button } from "@/registry/bases/base/ui/button";
import { Input } from "@/registry/bases/base/ui/input";
import { Label } from "@/registry/bases/base/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/registry/bases/base/ui/responsive-dialog";

export default function ResponsiveDialogDemo() {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger
        render={<Button variant="outline">Edit Profile</Button>}
      />
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit profile</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button type="submit">Save changes</Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
