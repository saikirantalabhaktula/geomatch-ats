import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from './services/job.service';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  job_url: string;
  description: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div class="max-w-6xl mx-auto">
        <!-- Top Navigation / Header -->
        <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 class="text-3xl font-extrabold text-white tracking-tight">GeoMatch <span class="text-sky-400">ATS</span></h1>
            </div>
            <p class="text-sm text-slate-400 mt-1">NLP-Ranked Resume Matches &bull; Sourced from LinkedIn & Indeed</p>
          </div>

          <!-- Location Search -->
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchCity"
              (input)="onSearch()"
              placeholder="Search location (e.g. Hyderabad)..."
              class="w-full md:w-80 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-sm"
            />
          </div>
        </header>

        <!-- Listing Metrics -->
        <div class="flex items-center justify-between text-xs font-medium text-slate-400 mb-6 px-1">
          <span>Showing <strong class="text-white">{{ jobs().length }}</strong> ranked openings</span>
          <span>Ranked by TF-IDF & Cosine Similarity</span>
        </div>

        <!-- Feedback States -->
        <div *ngIf="loading()" class="text-center py-20 text-slate-400 animate-pulse">
          Retrieving live listings from database...
        </div>

        <div *ngIf="!loading() && jobs().length === 0" class="text-center py-20 text-slate-400">
          No matching listings found for this search filter.
        </div>

        <!-- Job Grid -->
        <div *ngIf="!loading() && jobs().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div *ngFor="let job of jobs()" class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-black/25">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                  {{ job.source }}
                </span>
                <span 
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full" 
                  [ngClass]="job.match_score >= 35 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'">
                  {{ job.match_score }}% Match
                </span>
              </div>

              <h2 class="text-base font-bold text-white line-clamp-1 mb-1" [title]="job.title">{{ job.title }}</h2>
              <p class="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                <span class="text-slate-300 font-medium">{{ job.company }}</span>
                <span>&bull;</span>
                <span>{{ job.location }}</span>
              </p>

              <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                {{ job.description }}
              </p>

              <div class="flex flex-wrap gap-1.5 mb-5">
                <span 
                  *ngFor="let skill of job.matched_skills" 
                  class="text-[11px] bg-sky-950/60 text-sky-300 border border-sky-800/40 px-2 py-0.5 rounded-md">
                  {{ skill }}
                </span>
              </div>
            </div>

            <a 
              [href]="job.job_url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full text-center py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold tracking-wide transition shadow-sm hover:shadow-sky-600/30">
              Apply on {{ job.source }} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  jobs = signal<Job[]>([]);
  loading = signal<boolean>(true);
  searchCity = '';

  constructor(private jobService: JobService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async onSearch() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const data = await this.jobService.fetchJobs(this.searchCity);
      this.jobs.set(data as Job[]);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
