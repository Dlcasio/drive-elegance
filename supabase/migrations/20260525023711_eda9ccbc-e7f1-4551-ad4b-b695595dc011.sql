
DROP POLICY IF EXISTS "inquiries_insert_any" ON public.inquiries;
CREATE POLICY "inquiries_insert_any" ON public.inquiries FOR INSERT
WITH CHECK (length(trim(name)) > 0 AND length(trim(email)) > 0 AND length(trim(message)) > 0);
