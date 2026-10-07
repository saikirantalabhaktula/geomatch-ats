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
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
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

  cleanDescription(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')          // removes all markdown bold asterisks
    .replace(/\s+/g, ' ')          // normalizes extra whitespace
    .trim();
}
}