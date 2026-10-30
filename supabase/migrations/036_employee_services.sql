-- Миграция 036: Связь сотрудников и услуг (employee_services) с override цен и длительности
-- Позволяет назначать конкретные услуги каждому сотруднику с индивидуальной ценой и длительностью.

create table if not exists public.employee_services (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  price_override numeric(10,2) default null, -- индивидуальная цена (если null, берется цена услуги)
  duration_override integer default null,    -- индивидуальная длительность в минутах (если null, берется длительность услуги)
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint employee_service_unique unique (employee_id, service_id)
);

-- Индексы для быстрого поиска
create index if not exists idx_employee_services_employee_id on public.employee_services(employee_id);
create index if not exists idx_employee_services_service_id on public.employee_services(service_id);

-- RLS (Row Level Security)
alter table public.employee_services enable row level security;

-- Политика: доступ на чтение и запись для аутентифицированных пользователей своего бизнеса
create policy "Users can manage employee services of their business"
  on public.employee_services
  for all
  to authenticated
  using (
    exists (
      select 1 from public.employees e
      join public.businesses b on b.id = e.business_id
      where e.id = employee_services.employee_id
      and (b.owner_id = auth.uid() or exists (
        select 1 from public.employees emp
        where emp.business_id = b.id and emp.user_id = auth.uid()
      ))
    )
  )
  with check (
    exists (
      select 1 from public.employees e
      join public.businesses b on b.id = e.business_id
      where e.id = employee_services.employee_id
      and (b.owner_id = auth.uid() or exists (
        select 1 from public.employees emp
        where emp.business_id = b.id and emp.user_id = auth.uid()
      ))
    )
  );

-- Публичный доступ на чтение для публичной страницы бронирования
create policy "Public can view active employee services"
  on public.employee_services
  for select
  to anon, authenticated
  using (is_active = true);
