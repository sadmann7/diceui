"use client";

import {
  Bell,
  CreditCard,
  FolderKanban,
  Mail,
  Settings,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import * as React from "react";

import {
  CommandStack,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackPage,
  CommandStackSeparator,
  CommandStackShortcut,
  type CommandStackValue,
} from "@/registry/bases/base/ui/command-stack";

const roles = [
  {
    value: "owner",
    label: "Owner",
    description: "Full access, including billing",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage members and settings",
  },
  {
    value: "member",
    label: "Member",
    description: "Create and edit projects",
  },
  { value: "guest", label: "Guest", description: "View shared projects only" },
];

const plans = [
  { value: "hobby", label: "Hobby", description: "Free for personal projects" },
  { value: "pro", label: "Pro", description: "$20 per seat each month" },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom pricing and support",
  },
];

const members = [
  { id: "olivia", name: "Olivia Martin", email: "olivia@acme.com" },
  { id: "jackson", name: "Jackson Lee", email: "jackson@acme.com" },
  { id: "isabella", name: "Isabella Nguyen", email: "isabella@acme.com" },
  { id: "william", name: "William Kim", email: "will@acme.com" },
];

const initialValue: CommandStackValue = {
  "role-olivia": ["owner"],
  "role-jackson": ["admin"],
  "role-isabella": ["member"],
  "role-william": ["guest"],
  plan: ["pro"],
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getLabel(
  options: { value: string; label: string }[],
  value: string | undefined,
) {
  return options.find((option) => option.value === value)?.label;
}

export default function CommandStackWorkspaceDemo() {
  const [value, setValue] = React.useState<CommandStackValue>(initialValue);

  function onValueChange(nextValue: CommandStackValue) {
    setValue((prevValue) => {
      const keptValue = { ...nextValue };
      for (const [page, selected] of Object.entries(nextValue)) {
        if (selected.length === 0 && prevValue[page]) {
          keptValue[page] = prevValue[page];
        }
      }
      return keptValue;
    });
  }

  return (
    <CommandStack
      value={value}
      onValueChange={onValueChange}
      className="w-full max-w-md border shadow-md"
    >
      <CommandStackInput placeholder="Search workspace..." />
      <CommandStackList>
        <CommandStackEmpty>No results found.</CommandStackEmpty>
        <CommandStackPage value="root" label="Home">
          <CommandStackGroup heading="Workspace">
            <CommandStackItem>
              <FolderKanban />
              Projects
              <CommandStackShortcut>G P</CommandStackShortcut>
            </CommandStackItem>
            <CommandStackItem page="settings">
              <Settings />
              Settings...
              <CommandStackShortcut>G S</CommandStackShortcut>
            </CommandStackItem>
          </CommandStackGroup>
          <CommandStackGroup heading="Account">
            <CommandStackItem>
              <Bell />
              Notifications
            </CommandStackItem>
          </CommandStackGroup>
        </CommandStackPage>

        <CommandStackPage
          value="settings"
          label="Settings"
          placeholder="Search settings..."
        >
          <CommandStackGroup heading="Workspace">
            <CommandStackItem page="members">
              <Users />
              Members...
              <span className="ml-auto text-xs text-muted-foreground">
                {members.length}
              </span>
            </CommandStackItem>
            <CommandStackItem page="billing">
              <CreditCard />
              Billing...
              <span className="ml-auto text-xs text-muted-foreground">
                {getLabel(plans, value.plan?.[0])}
              </span>
            </CommandStackItem>
          </CommandStackGroup>
        </CommandStackPage>

        <CommandStackPage
          value="members"
          label="Members"
          placeholder="Search members..."
        >
          <CommandStackGroup heading={`${members.length} members`}>
            {members.map((member) => (
              <CommandStackItem
                key={member.id}
                value={`${member.name} ${member.email}`}
                page={`member-${member.id}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-[10px] font-medium">
                  {getInitials(member.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{member.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {getLabel(roles, value[`role-${member.id}`]?.[0])}
                </span>
              </CommandStackItem>
            ))}
          </CommandStackGroup>
        </CommandStackPage>

        {members.map((member) => (
          <CommandStackPage
            key={member.id}
            value={`member-${member.id}`}
            label={member.name}
            placeholder={`Manage ${member.name}...`}
          >
            <CommandStackGroup heading={member.email}>
              <CommandStackItem page={`role-${member.id}`}>
                <UserCog />
                Change role...
                <span className="ml-auto text-xs text-muted-foreground">
                  {getLabel(roles, value[`role-${member.id}`]?.[0])}
                </span>
              </CommandStackItem>
              <CommandStackItem>
                <Mail />
                Send email
              </CommandStackItem>
            </CommandStackGroup>
            <CommandStackSeparator />
            <CommandStackGroup>
              <CommandStackItem className="text-destructive data-selected:text-destructive *:[svg]:text-destructive! data-selected:*:[svg]:text-destructive!">
                <Trash2 />
                Remove from workspace
              </CommandStackItem>
            </CommandStackGroup>
          </CommandStackPage>
        ))}

        {members.map((member) => (
          <CommandStackPage
            key={member.id}
            value={`role-${member.id}`}
            label="Role"
            placeholder={`Change role for ${member.name}...`}
            selectionMode="single"
          >
            <CommandStackGroup heading="Role">
              {roles.map((role) => (
                <CommandStackItem key={role.value} value={role.value}>
                  <span className="flex flex-col">
                    <span>{role.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </span>
                </CommandStackItem>
              ))}
            </CommandStackGroup>
          </CommandStackPage>
        ))}

        <CommandStackPage
          value="billing"
          label="Billing"
          placeholder="Search billing..."
        >
          <CommandStackGroup heading="Billing">
            <CommandStackItem page="plan">
              <CreditCard />
              Change plan...
              <span className="ml-auto text-xs text-muted-foreground">
                {getLabel(plans, value.plan?.[0])}
              </span>
            </CommandStackItem>
            <CommandStackItem>
              <Mail />
              Billing email
            </CommandStackItem>
          </CommandStackGroup>
        </CommandStackPage>

        <CommandStackPage
          value="plan"
          label="Plan"
          placeholder="Change plan..."
          selectionMode="single"
        >
          <CommandStackGroup heading="Plan">
            {plans.map((plan) => (
              <CommandStackItem key={plan.value} value={plan.value}>
                <span className="flex flex-col">
                  <span>{plan.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.description}
                  </span>
                </span>
              </CommandStackItem>
            ))}
          </CommandStackGroup>
        </CommandStackPage>
      </CommandStackList>
    </CommandStack>
  );
}
