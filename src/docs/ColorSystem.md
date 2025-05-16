# Cliniko Color System Guidelines

This document outlines the color system used throughout the Cliniko application to ensure consistency across all components and pages.

## Role-Specific Colors

These colors are used to visually distinguish between different user roles in the system:

| Role | Primary Color | CSS Variable | Hex Code |
|------|--------------|--------------|----------|
| Doctor | Blue | `--medical-doctor` | `#2563eb` |
| Nurse | Green | `--medical-nurse` | `#10b981` |
| Admin | Purple | `--medical-admin` | `#8b5cf6` |
| Staff | Slate | `--medical-staff` | `#64748b` |

Each role color has variant shades that can be used:
- `/10` opacity for backgrounds (e.g., `bg-medical-doctor/10`)
- `/20` opacity for borders (e.g., `border-medical-doctor/20`)
- Main color for text (e.g., `text-medical-doctor`)
- `-dark` suffix for hover states (e.g., `hover:bg-medical-doctor-dark`)

## Status Colors

For representing the status of items (appointments, tasks, etc.):

| Status | Badge Variant | Based On |
|--------|--------------|----------|
| Scheduled | `scheduled` | Nurse color |
| Completed | `completed` | Doctor color |
| Cancelled | `cancelled` | Red color |
| Pending | `pending` | Yellow/amber color |

## Usage in Badge Component

```tsx
// For role-specific badges
<Badge variant="doctor">Doctor</Badge>
<Badge variant="nurse">Nurse</Badge>
<Badge variant="admin">Admin</Badge>
<Badge variant="staff">Staff</Badge>

// For status badges
<Badge variant="scheduled">Scheduled</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="cancelled">Cancelled</Badge>
<Badge variant="pending">Pending</Badge>
```

## CSS Variables

All medical-specific colors are available as CSS variables in the `:root` selector in `index.css`:

```css
:root {
  --medical-doctor: #2563eb;
  --medical-doctor-light: #eff6ff;
  --medical-doctor-medium: #60a5fa;
  --medical-doctor-dark: #1d4ed8;
  
  --medical-nurse: #10b981;
  --medical-nurse-light: #ecfdf5;
  --medical-nurse-medium: #34d399;
  --medical-nurse-dark: #059669;
  
  --medical-admin: #8b5cf6;
  --medical-admin-light: #f5f3ff;
  --medical-admin-medium: #a78bfa;
  --medical-admin-dark: #6d28d9;
  
  --medical-staff: #64748b;
  --medical-staff-light: #f8fafc;
  --medical-staff-medium: #94a3b8;
  --medical-staff-dark: #475569;
  
  --status-scheduled: var(--medical-nurse);
  --status-completed: var(--medical-doctor);
  --status-cancelled: #ef4444;
  --status-pending: #f59e0b;
}
```

## Design Principles

1. **Consistency**: Use the appropriate role color for components related to that role
2. **Hierarchy**: Use color to establish visual hierarchy and guide user attention
3. **Accessibility**: Ensure sufficient contrast for text readability
4. **Intent**: Use status colors to clearly communicate the state of items

## Component Usage Examples

- Dashboard cards should use role-specific colors based on function
- User avatars should use their role color
- Navigation items should highlight using the user's role color
- Badges should use consistent variants for status and roles 