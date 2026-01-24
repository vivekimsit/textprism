'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Intent } from '@/lib/intent-matrix';

interface DynamicFormProps {
  intent: Intent | null;
  role: string;
  vibe: string;
  fieldValues: Record<string, string>;
  onRoleChange: (role: string) => void;
  onVibeChange: (vibe: string) => void;
  onFieldChange: (fieldName: string, value: string) => void;
}

const ROLES = [
  { value: 'junior-engineer', label: 'Junior Engineer' },
  { value: 'mid-level-engineer', label: 'Mid-Level Engineer' },
  { value: 'senior-engineer', label: 'Senior Engineer' },
  { value: 'staff-engineer', label: 'Staff Engineer' },
  { value: 'tech-lead', label: 'Tech Lead' },
  { value: 'engineering-manager', label: 'Engineering Manager' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'founder', label: 'Founder/CEO' },
];

const VIBES = [
  { value: 'direct', label: 'Direct', description: 'Straight to the point' },
  { value: 'empathetic', label: 'Empathetic', description: 'Warm and understanding' },
  { value: 'authoritative', label: 'Authoritative', description: 'Confident and commanding' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { value: 'formal', label: 'Formal', description: 'Professional and polished' },
];

export function DynamicForm({
  intent,
  role,
  vibe,
  fieldValues,
  onRoleChange,
  onVibeChange,
  onFieldChange,
}: DynamicFormProps) {
  if (!intent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a Scenario</CardTitle>
          <CardDescription>
            Choose a platform and scenario from the tabs above to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent.name}</CardTitle>
        <CardDescription>{intent.outcomeLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selector */}
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map(r => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vibe Selector */}
        <div className="space-y-2">
          <Label htmlFor="vibe">Communication Style</Label>
          <Select value={vibe} onValueChange={onVibeChange}>
            <SelectTrigger id="vibe">
              <SelectValue placeholder="Select your style" />
            </SelectTrigger>
            <SelectContent>
              {VIBES.map(v => (
                <SelectItem key={v.value} value={v.value}>
                  <div className="flex flex-col">
                    <span>{v.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-4 border-t pt-4">
          {intent.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'input' ? (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                />
              ) : (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  rows={4}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
