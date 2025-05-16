-- Update the auth.config table with the correct site URL and redirect URLs

UPDATE auth.config
SET 
  site_url = 'https://cliniko.lovable.app',
  additional_redirect_urls = ARRAY[
    'https://cliniko.lovable.app/reset-password',
    'https://cliniko.lovable.app'
  ]::text[]; 