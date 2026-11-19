-- Migration 068: Fix PostgREST schema cache for vehicle_body_types relationship
-- Grant SELECT on reference tables to anon role so PostgREST can detect FK relationships

GRANT SELECT ON public.vehicle_body_types TO anon;
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.clients TO anon;
GRANT SELECT ON public.businesses TO anon;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';