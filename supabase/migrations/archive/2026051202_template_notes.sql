-- ======================================================================================
-- Phase 2b: Notes for Static Calendar Templates
-- ======================================================================================

-- 1. Create Template Notes Table
CREATE TABLE public.tf_plan_template_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Template Notes (Inherit from parent template)
ALTER TABLE public.tf_plan_template_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes for visible templates" ON public.tf_plan_template_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_notes.template_id
        )
    );

CREATE POLICY "Users can manage notes for their own templates" ON public.tf_plan_template_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_notes.template_id
            AND tf_plan_templates.created_by = auth.uid()
        )
    );
