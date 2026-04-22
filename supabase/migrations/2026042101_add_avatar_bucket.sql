-- Set up Storage for Avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('pf_avatars', 'pf_avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'pf_avatars' );

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
