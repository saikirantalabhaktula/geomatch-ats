import os
from dotenv import load_dotenv
from jobspy import scrape_jobs
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file!")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CORE_SKILLS = [
    "python", "pandas", "numpy", "scikit-learn", "sql", 
    "machine learning", "git", "fastapi", "docker", "angular"
]

RESUME_SUMMARY = """
Python Developer and Data Science enthusiast with hands-on expertise in 
Scikit-Learn, Pandas, NumPy, Machine Learning algorithms, SQL databases, 
Git workflows, REST APIs, and Supabase integration.
"""

def run_pipeline():
    print("Scraping jobs for Hyderabad...")
    jobs_df = scrape_jobs(
        site_name=["indeed", "linkedin"],
        search_term="Python Data Science Developer",
        location="Hyderabad, India",
        results_wanted=15,
        hours_old=72,
        country_indeed="India"
    )

    if jobs_df.empty:
        print("No listings returned.")
        return

    print(f"Found {len(jobs_df)} raw listings. Computing match scores...")

    descriptions = jobs_df['description'].fillna('').tolist()
    corpus = [RESUME_SUMMARY] + descriptions
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    # Compares resume (index 0) against all job descriptions (indices 1 to N)
    scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    records = []
    # Use enumerate to guarantee clean 0 to len-1 indexing
    for i, (_, row) in enumerate(jobs_df.iterrows()):
        desc = str(row.get('description', '')).lower()
        match_percentage = round(float(scores[i]) * 100, 2)
        
        matched = [s for s in CORE_SKILLS if s in desc]
        missing = [s for s in CORE_SKILLS if s not in desc][:4]

        records.append({
            "title": row.get('title') or "Software Engineer",
            "company": row.get('company') or "Confidential",
            "location": row.get('city') or "Hyderabad",
            "source": row.get('site') or "Direct",
            "job_url": row.get('job_url'),
            "description": desc[:300],
            "match_score": match_percentage,
            "matched_skills": matched,
            "missing_skills": missing
        })

    supabase.table("jobs").upsert(records, on_conflict="job_url").execute()
    print(f"Successfully upserted {len(records)} jobs into Supabase.")

if __name__ == "__main__":
    run_pipeline()
