create or replace function public.lookup_donation_receipt(p_query text, p_last4 text)
returns table (
  id uuid, donor_name text, donor_phone text, amount numeric, method text,
  purpose text, transaction_id text, status text, donated_at date, created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare r public.donations%rowtype;
begin
  if p_last4 !~ '^\d{4}$' or length(coalesce(p_query,'')) < 4 then
    return;
  end if;
  if p_query ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into r from public.donations d where d.id = p_query::uuid limit 1;
  else
    select * into r from public.donations d where d.transaction_id = p_query limit 1;
  end if;
  if r.id is null then return; end if;
  if right(regexp_replace(coalesce(r.donor_phone,''), '\D', '', 'g'), 4) <> p_last4 then
    raise exception 'ফোন নম্বরের শেষ ৪ ডিজিট মিলছে না';
  end if;
  return query select r.id, r.donor_name, r.donor_phone, r.amount, r.method, r.purpose,
    r.transaction_id, r.status, r.donated_at, r.created_at;
end;
$$;

revoke all on function public.lookup_donation_receipt(text, text) from public;
grant execute on function public.lookup_donation_receipt(text, text) to anon, authenticated;

create or replace function public.lookup_member_card(p_code text, p_last4 text)
returns table (
  id uuid, member_code text, name text, phone text, email text, area text,
  role text, status text, photo_url text, join_date date
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare r public.members%rowtype;
begin
  if p_last4 !~ '^\d{4}$' or length(coalesce(p_code,'')) < 4 then
    return;
  end if;
  select * into r from public.members m where m.member_code = upper(p_code) limit 1;
  if r.id is null then return; end if;
  if right(regexp_replace(coalesce(r.phone,''), '\D', '', 'g'), 4) <> p_last4 then
    raise exception 'ফোন নম্বরের শেষ ৪ ডিজিট মিলছে না';
  end if;
  if r.status <> 'approved' then
    raise exception 'আপনার সদস্যপদ এখনো অনুমোদিত হয়নি। অনুমোদনের পর কার্ড দেখতে পারবেন।';
  end if;
  return query select r.id, r.member_code, r.name, r.phone, r.email, r.area, r.role, r.status, r.photo_url, r.join_date;
end;
$$;

revoke all on function public.lookup_member_card(text, text) from public;
grant execute on function public.lookup_member_card(text, text) to anon, authenticated;