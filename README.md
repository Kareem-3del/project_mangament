# Project Management System

A comprehensive project management system built with Next.js 14, Supabase, and TypeScript for managing remote teams, tracking time, and handling work tickets.

## Features

- **User Authentication**: Secure sign-up/login with role-based access control (Admin, Project Manager, Team Member, Client)
- **Project Management**: Create, update, and track projects with multiple team members
- **Ticket System**: Full-featured ticketing with priorities, statuses, comments, and file attachments
- **Time Tracking**: Check-in/check-out system with automatic duration calculation
- **Real-time Updates**: Leverages Supabase real-time subscriptions
- **Role-Based Permissions**: Granular access control for different user roles
- **Activity Logging**: Automatic tracking of all system activities
- **Dashboard Analytics**: Overview of projects, tickets, and time tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Server Components

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key
3. Go to SQL Editor and run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Update the file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Storage Buckets (Optional for File Attachments)

In your Supabase project:

1. Go to Storage
2. Create a new bucket named `ticket-attachments`
3. Set the bucket to public or configure appropriate policies

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles and Permissions

### Admin
- Full system access
- Manage company settings
- Create/update/delete users
- Create/update/delete projects
- View all time entries and reports

### Project Manager
- Create and manage projects
- Assign team members to projects
- Create/update/delete tickets
- View team time entries
- Access reports

### Team Member
- View assigned projects
- Create and update tickets
- Track personal time
- Comment on tickets

### Client
- Read-only access to assigned projects
- View tickets and comments
- No time tracking access

## Database Schema

The system uses the following main tables:

- `companies` - Organization data
- `users` - User profiles (extends Supabase auth.users)
- `projects` - Project information
- `project_members` - Project team assignments
- `tickets` - Work items/tasks
- `ticket_comments` - Discussion threads on tickets
- `ticket_attachments` - File uploads
- `time_entries` - Check-in/check-out records
- `activity_logs` - System audit trail

## Key Features Implementation

### Time Tracking
- Simple check-in/check-out interface
- Automatic duration calculation
- Auto-checkout after 12 hours
- Project and ticket association
- Billable/non-billable hours

### Ticket Management
- Kanban board view (Status: Todo, In Progress, In Review, Done)
- Priority levels (Low, Medium, High, Urgent)
- File attachments support
- Comment system with real-time updates
- Assignment and due dates

### Project Management
- Multiple projects per company
- Team member roles (Manager, Member, Viewer)
- Project status tracking
- Time tracking per project

## Security Features

- Row Level Security (RLS) policies on all tables
- Role-based access control
- Secure file upload handling
- Activity logging for audit trails
- Protected API routes

## Development

### Project Structure

```
project_mangemnet/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and helpers
│   ├── api/              # API functions
│   ├── auth/             # Auth utilities
│   ├── supabase/         # Supabase client setup
│   └── utils.ts          # Helper functions
└── supabase/            # Database migrations
    └── migrations/       # SQL migration files
```

### Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys in `.env.local`
- Check that RLS policies are correctly applied
- Ensure user profile is created in `users` table

### Database Connection Issues
- Confirm migrations are run in correct order
- Check Supabase project is active
- Verify network connectivity

### Permission Errors
- Review RLS policies for the affected table
- Ensure user has correct role assigned
- Check project membership for project-specific resources

## Future Enhancements

- Email notifications
- Slack/Teams integrations
- Advanced reporting and analytics
- Custom ticket fields
- Recurring tasks
- Mobile app
- API for third-party integrations
- Webhooks

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
