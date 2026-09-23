-- Mughees Edtior production database blueprint (PostgreSQL)
-- Review with your backend engineer before production use.

create table users (
  id uuid primary key,
  email varchar(255) unique not null,
  password_hash text not null,
  role varchar(30) not null check (role in ('student','admin','super_admin','trainer')),
  status varchar(30) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table student_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  student_code varchar(40) unique not null,
  full_name varchar(180) not null,
  phone varchar(40),
  city varchar(120),
  program_label varchar(180),
  bio text,
  course_progress numeric(5,2) not null default 0,
  attendance numeric(5,2) not null default 0,
  performance_label varchar(80) default 'New',
  available_balance numeric(14,2) not null default 0,
  total_paid numeric(14,2) not null default 0,
  lifetime_approved_earnings numeric(14,2) not null default 0,
  preferred_payout_method varchar(40),
  payout_account_encrypted text
);

create table courses (
  id uuid primary key,
  title varchar(220) not null,
  description text,
  status varchar(30) not null default 'active',
  created_at timestamptz not null default now()
);

create table course_enrollments (
  id uuid primary key,
  course_id uuid not null references courses(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  progress numeric(5,2) not null default 0,
  unique(course_id, student_id)
);

create table live_classes (
  id uuid primary key,
  title varchar(220) not null,
  trainer_id uuid references users(id),
  starts_at timestamptz not null,
  batch_label varchar(150),
  join_url_encrypted text,
  recording_url text,
  status varchar(30) not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table creator_programs (
  id uuid primary key,
  name varchar(160) unique not null,
  description text,
  status varchar(30) not null default 'active',
  created_at timestamptz not null default now()
);

create table trend_updates (
  id uuid primary key,
  program_id uuid references creator_programs(id) on delete set null,
  title varchar(240) not null,
  difficulty varchar(30),
  tutorial_url text,
  status varchar(30) not null default 'new',
  published_at timestamptz not null default now()
);

create table approved_earnings (
  id uuid primary key,
  student_id uuid not null references users(id) on delete cascade,
  program_id uuid references creator_programs(id) on delete set null,
  approved_amount numeric(14,2) not null check (approved_amount >= 0),
  internal_source_gross numeric(14,2), -- ADMIN ONLY; never expose through student API
  internal_note text,                 -- ADMIN ONLY
  public_note varchar(240),
  earning_date date not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table withdrawal_requests (
  id uuid primary key,
  student_id uuid not null references users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  payout_method varchar(40) not null check (payout_method in ('JazzCash','Easypaisa','SadaPay','NayaPay','Bank Transfer')),
  payout_account_encrypted text not null,
  status varchar(30) not null default 'pending' check (status in ('pending','paid','rejected','failed')),
  payment_reference varchar(180),
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  reviewed_by uuid references users(id)
);

create table notifications (
  id uuid primary key,
  student_id uuid not null references users(id) on delete cascade,
  title varchar(180) not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id bigserial primary key,
  actor_user_id uuid references users(id),
  action varchar(120) not null,
  entity_type varchar(80),
  entity_id varchar(120),
  before_json jsonb,
  after_json jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- Production requirements:
-- 1) Never return internal_source_gross or internal_note to student-facing APIs.
-- 2) All balance mutations must run in a DB transaction and create an audit log.
-- 3) Reserve withdrawal amount atomically when a request is submitted.
-- 4) Restore reserved amount on rejection/failure when appropriate.
-- 5) Encrypt payout account details at rest.
-- 6) Hash passwords using Argon2id or bcrypt; never store plaintext passwords.
-- 7) Add rate limits, CSRF protection, session rotation, admin 2FA and backups.
