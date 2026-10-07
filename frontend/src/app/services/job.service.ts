import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private supabase: SupabaseClient;

  // Replace these with your actual Supabase Project URL and public anon key
  private supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
  private supabaseAnonKey = 'YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE';

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
  }

  async fetchJobs(searchCity: string = '') {
    let query = this.supabase
      .from('jobs')
      .select('*')
      .order('match_score', { ascending: false });

    if (searchCity.trim()) {
      query = query.ilike('location', `%${searchCity.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
    return data || [];
  }
}
