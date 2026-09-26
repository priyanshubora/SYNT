SNYT
SNYT | Esports Community & Discussion Platform

Live: https://your-domain.com
GitHub: https://github.com/yourusername/snyt

A full-stack esports community platform inspired by modern competitive-gaming forums, built from the ground up with Next.js, TypeScript, PostgreSQL and Supabase. Users can create discussions, comment, vote, follow community activity, manage profiles, and participate in a role-based moderation system.

1. What SNYT actually is

SNYT is a Reddit-style community platform focused on esports and gaming.

Users can:

Browse esports communities
Create discussion threads
Comment on threads
Reply to comments
Upvote/downvote content
Create and customize profiles
Select an esports team/flair
Receive notifications
Earn reputation
Progress through ranks
Report inappropriate content
Interact with moderators

The platform also has:

Moderator tools
Admin controls
Content deletion/restoration
Thread locking
User roles
Notification preferences
Account management
Data export
Account deletion

So, technically, it is considerably more interesting than:

“I made a website where people post stuff.”

Humanity has somehow managed to make CRUD sound impressive on a resume. Yours has enough infrastructure to justify being more specific.

2. Core Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
HTML5
CSS

You are using Next.js App Router, which gives you a mixture of server-rendered and client-side interactive components.

Backend
Next.js Server Components
Next.js Server Actions
Next.js Route Handlers
Supabase
PostgreSQL
REST-style API routes
Authentication
Supabase Auth
Google OAuth
JWT-based authentication
Session management
Protected routes

Supabase Auth supports social providers such as Google and integrates authentication tokens with database authorization.

Database
PostgreSQL
Supabase
SQL
Foreign Keys
Indexes
Triggers
Views
Row Level Security
Storage
Supabase Storage
Team logos
Profile images
Public asset storage
Deployment
Vercel
Custom domain
Production environment variables
Git-based deployment

Vercel supports attaching and managing custom domains for deployed projects.

3. Main Architecture

The basic architecture is:

                     USER
                      │
                      ▼
              ┌──────────────┐
              │   Next.js    │
              │  App Router  │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Server      Client      API
     Components  Components   Routes
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
              ┌──────────────┐
              │   Supabase   │
              ├──────────────┤
              │ Auth         │
              │ PostgreSQL   │
              │ Storage      │
              │ RLS          │
              └──────────────┘

This is one of the strongest things to mention in an interview because it shows you understand the difference between:

UI
server logic
authentication
authorization
persistent data
file storage
4. Authentication

SNYT uses Google OAuth through Supabase Auth.

Authentication flow:

User
 ↓
Google Login
 ↓
Supabase Auth
 ↓
Authenticated session
 ↓
Profile creation/setup
 ↓
SNYT account

Users can browse public content without logging in.

Authentication is required for actions such as:

Creating threads
Commenting
Voting
Editing personal profile
Receiving personal notifications
Accessing account settings

Supabase Auth uses JWT-based authentication and integrates with Postgres authorization through RLS.

5. Database Architecture

The main database entities include:

profiles
teams
categories
threads
comments
thread_votes
comment_votes
notifications
notification_preferences
reports
moderation_actions

Relationships are approximately:

User
 │
 ├── Threads
 │     │
 │     └── Comments
 │
 ├── Votes
 │
 ├── Notifications
 │
 ├── Reports
 │
 └── Profile
       │
       └── Team
6. PostgreSQL Row Level Security

This is one of the best technical points to put on your resume.

SNYT doesn't rely solely on frontend checks such as:

if (user.role === 'admin')

to protect important operations.

The database uses PostgreSQL Row Level Security policies.

For example:

Anonymous user
    ↓
Can read public threads/comments

Authenticated user
    ↓
Can create their own content
    ↓
Can modify their own content

Moderator
    ↓
Can perform moderation operations

Admin
    ↓
Can manage moderation/users

Supabase specifically recommends using RLS to enforce granular row-level authorization, with policies determining which rows a role can access or modify.

That's a much better interview talking point than “I used Supabase because it was easy.”

7. Community System

SNYT currently has six communities:

Esports
BGMI
Valorant
Chess
Free Fire
Off-Topic / Lounge

Each community has:

Threads
Sorting
Pagination
Voting
Comments
Community-specific content

Users can browse without authentication.

8. Thread System

Users can create threads containing:

Title
Content
Author
Community
Creation time
Votes
Comments

Threads support:

Upvotes/downvotes
Comment counts
Thread sorting
Editing
Deletion
Moderation
Locking
Reporting

Thread pages also support nested comments.

9. Comment System

Comments support:

Comments
   └── Replies
        └── Nested replies

Users can:

Create comments
Reply to comments
Vote on comments
Edit their comments
Delete their comments
Report comments

The system also supports mentions such as:

@username

which can generate notifications.

10. Voting System

SNYT has separate voting systems for:

Thread votes
Comment votes

Votes are stored in the database rather than being treated as a temporary frontend state.

This allows SNYT to calculate:

Thread score
Comment score
User reputation
11. User Profiles

Each user can have:

Username
Avatar
Team
Region
Reputation
Rank
Join date
Threads
Comments
Votes received

Team selection is divided into:

Indian Teams
International Teams

Team logos are stored through Supabase Storage.

12. Team / Flair System

Users can select an esports team during profile setup.

For example:

Username
Team Soul logo
India

The team/flair is displayed next to the username throughout the platform.

Team data contains:

Team name
Logo
Region

Storage structure:

snyt-team-logos/
├── indian/
└── international/

This is a nice example of connecting:

PostgreSQL relational data + object storage + frontend rendering.

13. Notification System

SNYT includes a notification system.

Notifications can be generated for:

Upvotes
Someone upvoted your thread.
Replies
Someone replied to your comment.
Mentions
Someone mentioned @username.

The system includes:

notifications
notification_preferences

Users can control notification preferences from Settings.

The notification bell also displays unread notification counts.

14. Moderation System

This is another strong recruiter-facing feature.

SNYT has three roles:

User
Moderator
Admin
User

Can:

Post
Comment
Vote
Report content
Edit own profile
Moderator

Can:

Delete content
Restore content
Lock threads
Unlock threads
Review reports
Perform moderation actions
Admin

Can additionally:

Manage moderators
Promote/demote moderators
Manage users
Manage rank configuration
Control moderation settings
15. Moderation Audit Trail

Moderation actions are recorded.

For example:

Moderator
   ↓
Delete Thread
   ↓
Reason
   ↓
moderation_actions

The database records things such as:

moderator_id
action
target_type
target_id
reason
created_at

This gives you an audit trail instead of simply deleting database rows and pretending nothing happened.

16. Reporting System

Users can report:

Thread
Comment

Possible report reasons include:

Spam
Harassment
Hate
NSFW
Impersonation
Off-topic
Other

Reports have statuses such as:

Pending
Reviewed
Dismissed
Action Taken

This connects the public community system with the moderation dashboard.

17. Soft Deletion

Instead of immediately destroying moderated content, SNYT supports deleted-state information such as:

deleted_at
deleted_by
deletion_reason

That gives moderators the ability to:

Delete
↓
Review
↓
Restore

rather than permanently destroying everything.

That's a useful architectural decision to discuss during an interview.

18. Thread Locking

Moderators can lock a thread.

Conceptually:

Thread
 ↓
is_locked = true
 ↓
Users can still read
 ↓
New comments disabled

This is different from deleting the thread.

That's another example of modeling moderation state explicitly rather than hacking behavior into the frontend.

19. Rank System

You're now introducing a seven-level system:

Community ranks
Rookie
Contender
Veteran
Elite
Legend
Staff ranks
Moderator
Admin

Normal ranks are based on reputation.

Moderator/Admin ranks come from the user's role.

The profile will include:

Current Rank
Rank Badge
Reputation
Progress Tracker
Next Rank
Rank Explanation
All Rank Levels

And rank badges will appear alongside usernames on:

Threads
Comments
Profiles
20. Reputation

Reputation is stored on the user's profile.

Conceptually:

Positive community interaction
          ↓
       Reputation
          ↓
       Rank system

The important architectural point is that:

Rank is derived from reputation/role rather than being blindly trusted from frontend state.

21. Profile Settings

SNYT has a settings system containing:

Profile
Username
Avatar
Team
Appearance
Light mode
Dark mode
Notifications
Upvotes
Replies
Mentions
Account
Download account data
Sign out
Delete account
22. Account Data Export

SNYT includes an account export function.

A user can request their stored information, including relevant account data such as:

Profile
Threads
Comments
Votes
Notifications
Notification preferences

That's a particularly nice feature to mention because it shows you thought beyond simply building the happy path.

23. Account Deletion

The platform also supports account deletion.

The sensitive administrative operation is performed server-side using the Supabase service-role credential rather than exposing that credential to the browser.

Supabase explicitly states that service-role/secret keys bypass RLS and should remain server-side.

That is something you can confidently discuss as part of your security architecture.

24. Server vs Client Architecture

One of the stronger technical decisions in SNYT is deciding what runs where.

Server-side

Used for things like:

Authentication checks
Database operations
Protected operations
Account deletion
Server Actions
Server-rendered data
Client-side

Used for:

Voting interactions
Theme switching
Comment composition
Notification dropdown
Profile interactions
Interactive UI

This avoids turning the entire application into one gigantic client component, which is the sort of thing developers do at 2 AM and then regret at 9 AM.

25. Next.js Features Used

You can specifically mention:

Next.js App Router
Server Components
Client Components
Dynamic Routes
Route Handlers
Server Actions
Middleware/session handling
Link prefetching
Image handling
Metadata

Next.js's App Router is designed around Server Components and modern React capabilities.

26. Performance

You have also worked on performance considerations.

Examples:

Server-side data fetching
Selective client components
Prefetching
Pagination
Database indexes
Efficient queries
Reusable database views
Avoiding unnecessary client requests

Your thread pages use pagination rather than attempting to render an infinite number of comments at once.

The architecture can also be improved further with maintained aggregate counters for:

Comment count
Vote score
Vote count

That would be a legitimate future optimization to mention under Future Improvements, rather than claiming it is already implemented.

27. SEO / Discoverability

Because SNYT is publicly deployed and has its own domain, you can include:

Custom domain
Search engine indexing
Metadata
Public thread URLs
Public community URLs

But be precise on the resume.

Don't write:

“Indexed by Google”

unless you have actually verified that.

Better:

Deployed on a custom domain with search-engine discoverability and production metadata.

If you have verified the domain through Google Search Console and can actually find SNYT in Google results, then you can say:

Deployed on a custom domain and indexed by Google.

Google provides Search Console specifically for monitoring search presence/indexing, so that's something you can verify rather than putting the usual “SEO optimized” fairy dust on a README.

28. Deployment

Production architecture:

GitHub
   ↓
Vercel
   ↓
Next.js Application
   ↓
Supabase
 ┌───────┬──────────┬─────────┐
 Auth   PostgreSQL  Storage

Environment variables include things such as:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

The service-role key is kept server-side.

29. Security

Your README should explicitly mention:

Authentication
Supabase Auth
Google OAuth
JWT sessions
Authorization
PostgreSQL RLS
User ownership policies
Moderator policies
Admin policies
Secrets
Environment variables
Server-side service-role key
Database
Foreign keys
Constraints
Indexes
RLS
Security-definer authorization helpers

Supabase's security model combines Postgres grants and RLS policies, so this is a legitimate architectural feature rather than merely a checkbox on the project description.

30. Suggested GitHub README

You can essentially use this structure:

# SNYT

### Esports Community & Discussion Platform

SNYT is a full-stack esports community platform built with
Next.js, TypeScript, PostgreSQL and Supabase.

Users can create discussions, comment, vote, customize profiles,
follow esports teams, receive notifications and participate in
a reputation-based ranking system.

The platform also includes role-based moderation tools for
moderators and administrators.

## Live Demo

https://YOUR-DOMAIN.com

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js Server Components
- Server Actions
- Route Handlers
- Supabase

### Database
- PostgreSQL
- Row Level Security
- SQL Views
- Database Functions
- Triggers
- Indexes
- Foreign Keys

### Authentication
- Supabase Auth
- Google OAuth
- JWT-based sessions

### Storage
- Supabase Storage

### Deployment
- Vercel
- Custom Domain

## Features

- Community-based esports discussions
- Thread creation and management
- Nested comments and replies
- Thread and comment voting
- User profiles
- Team/flair system
- Indian and international esports teams
- Reputation system
- Seven-level rank system
- Notification system
- Notification preferences
- Content reporting
- Moderator dashboard
- Admin moderation controls
- Thread locking
- Soft deletion and restoration
- Moderation audit logs
- Account data export
- Account deletion
- Light/dark theme
- Responsive UI

## Communities

- Esports
- BGMI
- Valorant
- Chess
- Free Fire
- Off-Topic

## User Roles

### User
Create threads, comment, vote and report content.

### Moderator
Moderate threads/comments, handle reports and manage
community content.

### Admin
Manage moderators, users, moderation and platform-level
configuration.

## Security

SNYT uses PostgreSQL Row Level Security to enforce
database-level authorization.

Authentication is handled through Supabase Auth and Google OAuth.

Administrative credentials are kept server-side and are never
exposed to the client.

## Architecture

Browser
    ↓
Next.js
    ↓
Supabase
    ├── Auth
    ├── PostgreSQL
    └── Storage

## Future Improvements

- Real-time notifications
- Advanced search
- More moderation automation
- Improved feed ranking
- Additional esports communities
- Performance optimization for large datasets
31. What to put on your resume

Don't put the entire README on your resume. Recruiters have suffered enough.

I'd use something like this:

SNYT | Full-Stack Esports Community Platform

Next.js, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Google OAuth, Vercel

Built and deployed a full-stack esports discussion platform with Next.js App Router, TypeScript, PostgreSQL and Supabase, supporting community threads, nested comments, voting, profiles and team flairs.
Implemented Google OAuth authentication and PostgreSQL Row Level Security, with role-based authorization for users, moderators and administrators.
Developed a moderation system with content reporting, soft deletion/restoration, thread locking, moderation audit logs and admin controls.
Built a reputation and ranking system, notification system, profile management, account data export and account deletion workflows.
Deployed the application to Vercel with a custom production domain, using Supabase for managed PostgreSQL, authentication and object storage.

That's much stronger than:

“Created an esports website using React.”

The latter sounds like a college assignment. The former tells a recruiter you actually dealt with authentication, authorization, databases, security, deployment and application architecture.

Your recruiter-facing tech keywords

Put these in your GitHub repository topics and resume where truthful:

Next.js
React
TypeScript
Tailwind CSS
PostgreSQL
Supabase
Supabase Auth
Google OAuth
Row Level Security
RBAC
REST APIs
Server Actions
Server Components
Postgres Views
Postgres Functions
Database Triggers
Database Indexing
Supabase Storage
Vercel
Git
GitHub
Responsive Web Design
Full-Stack Development

And for the live-site claim, use your actual domain and actual Google indexing status, not “Google and stuff.” Recruiters understand URLs; they have not yet developed telepathy.
