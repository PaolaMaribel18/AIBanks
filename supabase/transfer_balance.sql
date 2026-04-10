-- Transferencia ATÓMICA (debit + credit) usando solo public.profiles.balance
-- Ejecutar este script en el SQL Editor de Supabase.

create or replace function public.transfer_balance(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_amount numeric
)
returns table(sender_balance numeric, recipient_balance numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_balance numeric;
  v_recipient_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount' using errcode = '22023';
  end if;

  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if auth.uid() <> p_sender_id then
    raise exception 'sender must be current user' using errcode = '42501';
  end if;

  if p_sender_id = p_recipient_id then
    raise exception 'cannot transfer to self' using errcode = '22023';
  end if;

  select balance
    into v_sender_balance
    from public.profiles
   where id = p_sender_id
   for update;

  if not found then
    raise exception 'sender profile not found' using errcode = 'P0002';
  end if;

  select balance
    into v_recipient_balance
    from public.profiles
   where id = p_recipient_id
   for update;

  if not found then
    raise exception 'recipient profile not found' using errcode = 'P0002';
  end if;

  if v_sender_balance < p_amount then
    raise exception 'insufficient balance' using errcode = 'P0001';
  end if;

  update public.profiles
     set balance = balance - p_amount
   where id = p_sender_id;

  update public.profiles
     set balance = balance + p_amount
   where id = p_recipient_id;

  return query
    select (v_sender_balance - p_amount) as sender_balance,
           (v_recipient_balance + p_amount) as recipient_balance;
end;
$$;

revoke all on function public.transfer_balance(uuid, uuid, numeric) from public;
grant execute on function public.transfer_balance(uuid, uuid, numeric) to authenticated;
