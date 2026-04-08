import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://eucrnjfbbnpkhmslhlsx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y3JuamZiYm5wa2htc2xobHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDczNDcsImV4cCI6MjA5MDAyMzM0N30.OZ4EJgTnKVcoxqnTuj4M8t27Ba_XU4Cbxv0bwRh7oiA";

export const supabase = createClient(supabaseUrl, supabaseKey);