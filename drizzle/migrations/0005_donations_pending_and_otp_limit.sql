CREATE OR REPLACE FUNCTION public.submit_donation(p_donor_name text, p_donor_phone text, p_amount numeric, p_method text, p_purpose text, p_transaction_id text, p_activity_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, transaction_id text, amount numeric, donor_name text, donated_at date, status text)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare new_id uuid;
begin
  if length(trim(coalesce(p_donor_name,''))) not between 2 and 100 then raise exception 'সঠিক নাম দিন'; end if;
  if p_donor_phone !~ '^01[3-9]\d{8}$' then raise exception 'সঠিক মোবাইল নম্বর দিন'; end if;
  if p_amount is null or p_amount < 10 or p_amount > 10000000 then raise exception 'সঠিক পরিমাণ দিন'; end if;
  if p_method not in ('bkash','nagad','rocket','bank','cash') then raise exception 'সঠিক পেমেন্ট মাধ্যম দিন'; end if;
  if length(trim(coalesce(p_purpose,''))) not between 1 and 120 then raise exception 'উদ্দেশ্য দিন'; end if;
  if p_transaction_id !~ '^[A-Za-z0-9-]{4,50}$' then raise exception 'সঠিক TX ID দিন'; end if;
  if exists (select 1 from donations d where d.transaction_id = p_transaction_id) then
    raise exception 'এই TX ID আগেই ব্যবহৃত হয়েছে';
  end if;
  insert into donations (donor_name, donor_phone, amount, method, purpose, transaction_id, activity_id, status, donated_at)
  values (trim(p_donor_name), p_donor_phone, round(p_amount), p_method, trim(p_purpose), p_transaction_id, p_activity_id, 'pending', current_date)
  returning donations.id into new_id;
  return query select d.id, d.transaction_id, d.amount, d.donor_name, d.donated_at, d.status from donations d where d.id = new_id;
end; $function$;

CREATE TABLE public.otp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.otp_requests TO authenticated;
GRANT ALL ON public.otp_requests TO service_role;
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own otp requests" ON public.otp_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users log own otp requests" ON public.otp_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX otp_requests_user_time ON public.otp_requests (user_id, created_at);