import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwfnqhixvryzkjnzpmij.supabase.co';
const supabaseKey = 'sb_publishable_cbgSRfyDO5CBVmcTaOAPOA_ylxnfJEb';

export const supabase = createClient(supabaseUrl, supabaseKey);