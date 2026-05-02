REVOKE EXECUTE ON FUNCTION public.bootstrap_default_policy() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_search_documents_tsv() FROM anon, authenticated, public;