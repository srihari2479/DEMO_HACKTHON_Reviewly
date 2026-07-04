-- Create table for PR audits
CREATE TABLE IF NOT EXISTS pr_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  repository VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_review', -- pending_review, approved, changes_requested
  git_diff TEXT,
  before_screenshot_url TEXT,
  after_screenshot_url TEXT,
  ai_summary TEXT,
  ai_risks TEXT,
  reviewer_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial mock data for the demo
INSERT INTO pr_audits (pr_number, title, author, repository, status, git_diff, before_screenshot_url, after_screenshot_url, ai_summary, ai_risks)
VALUES (
  104,
  'Redesign Login and Add Google OAuth',
  'dev_sarah',
  'enterprise-portal',
  'pending_review',
  'diff --git a/components/Login.js b/components/Login.js
index 838afd..92fa1b 100644
--- a/components/Login.js
+++ b/components/Login.js
@@ -10,6 +10,12 @@ export default function Login() {
       <button className="bg-indigo-600 text-white">Sign In</button>
+      <button className="bg-blue-500 text-white flex items-center">
+        <img src="/google-icon.svg" /> Sign in with Google
+      </button>
+      <a href="/signup" className="text-gray-500 mt-8">Don''t have an account? Sign Up</a>',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60', -- Mock Before UI
  'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600&auto=format&fit=crop&q=60', -- Mock After UI
  'Added a blue Google Sign-In button and modified container padding.',
  'High Risk: The Sign Up link has been pushed below the fold on mobile viewports due to the added button height and mt-8 margin.'
) ON CONFLICT DO NOTHING;
