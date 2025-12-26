# Learnbeat-Style Structured Learning Content Design for Cautie

## Overview

This design integrates Learnbeat-style hierarchical structured learning content into Cautie, enabling rich educational experiences with chapters, sections, and embedded assignments within classes.

## Existing Tables Leveraged

- **classes**: Core class structure
- **blocks**: Rich content blocks (text, images, code, etc.)
- **assignments**: Assignment system with enhanced types
- **class_members**: Membership and roles

## New Table Structures

### class_chapters

```sql
CREATE TABLE public.class_chapters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT class_chapters_pkey PRIMARY KEY (id),
    CONSTRAINT class_chapters_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);
```

## Table Modifications

### blocks

Extend existing blocks table to support chapter sections:

```sql
ALTER TABLE public.blocks ADD COLUMN chapter_id uuid REFERENCES public.class_chapters (id) ON DELETE CASCADE;
ALTER TABLE public.blocks ALTER COLUMN material_id DROP NOT NULL;
ALTER TABLE public.blocks ADD CONSTRAINT blocks_parent_check CHECK (
    (material_id IS NOT NULL AND chapter_id IS NULL) OR
    (material_id IS NULL AND chapter_id IS NOT NULL)
);
```

### assignments

Add optional references for embedding:

```sql
ALTER TABLE public.assignments ADD COLUMN chapter_id uuid REFERENCES public.class_chapters (id) ON DELETE SET NULL;
ALTER TABLE public.assignments ADD COLUMN block_id uuid REFERENCES public.blocks (id) ON DELETE SET NULL;
```

## Relationships

```
classes (1) ──── (many) class_chapters
    │
    └─── (many) assignments

class_chapters (1) ──── (many) blocks (sections)
    │
    └─── (many) assignments (embedded)

blocks (1) ──── (many) assignments (embedded)

materials (1) ──── (many) blocks (existing)
```

## Data Flow

### Content Creation

1. **Teacher creates class** (existing)
2. **Add chapters to class**
   - API: `POST /api/classes/{classId}/chapters`
   - Payload: `{ title, description, order_index }`
3. **Create sections within chapters**
   - Use existing block system
   - API: `POST /api/classes/{classId}/chapters/{chapterId}/blocks`
   - Blocks have `chapter_id` instead of `material_id`
4. **Embed assignments**
   - Create assignments with `chapter_id` and/or `block_id`
   - API: `POST /api/classes/{classId}/assignments` with embedding refs

### Content Consumption

1. **Student joins class** (existing)
2. **Browse chapters**
   - API: `GET /api/classes/{classId}/chapters`
3. **Read chapter content**
   - API: `GET /api/classes/{classId}/chapters/{chapterId}/blocks`
   - Renders blocks with rich content
4. **Complete embedded assignments**
   - Assignments appear inline in chapters/sections
   - Submit via existing assignment flow

### Agenda Integration

- Assignments with `chapter_id`/`block_id` appear in class agenda
- Due dates trigger notifications
- Progress tracking shows chapter/section completion

## User Permissions and Access Control

### RLS Policies

#### class_chapters

```sql
ALTER TABLE public.class_chapters ENABLE ROW LEVEL SECURITY;

-- Teachers can manage chapters
CREATE POLICY "Teachers can manage chapters" ON public.class_chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_chapters.class_id
            AND (
                c.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.class_members cm
                    WHERE cm.class_id = c.id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'teacher'
                )
            )
        )
    );

-- Members can view chapters
CREATE POLICY "Members can view chapters" ON public.class_chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            LEFT JOIN public.class_members cm ON cm.class_id = c.id
            WHERE c.id = class_chapters.class_id
            AND (
                c.owner_id = auth.uid() OR
                cm.user_id = auth.uid()
            )
        )
    );
```

#### blocks (extended)

Update existing blocks policies to handle chapter blocks:

```sql
-- Existing material blocks policy remains
CREATE POLICY "Users can manage blocks for their materials" ON public.blocks
    FOR ALL USING (
        material_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.materials m
            WHERE m.id = blocks.material_id AND m.user_id = auth.uid()
        )
    );

-- New policy for chapter blocks
CREATE POLICY "Teachers can manage chapter blocks" ON public.blocks
    FOR ALL USING (
        chapter_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.class_chapters ch
            JOIN public.classes c ON c.id = ch.class_id
            WHERE ch.id = blocks.chapter_id
            AND (
                c.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.class_members cm
                    WHERE cm.class_id = c.id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'teacher'
                )
            )
        )
    );

-- Members can view chapter blocks
CREATE POLICY "Members can view chapter blocks" ON public.blocks
    FOR SELECT USING (
        chapter_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.class_chapters ch
            JOIN public.classes c ON c.id = ch.class_id
            LEFT JOIN public.class_members cm ON cm.class_id = c.id
            WHERE ch.id = blocks.chapter_id
            AND (
                c.owner_id = auth.uid() OR
                cm.user_id = auth.uid()
            )
        )
    );
```

#### assignments (unchanged policies, extended relationships)

Existing policies based on `class_id` remain, new columns allow embedding but don't change access control.

## Rich Content Support

- **Text blocks**: Rich text with formatting
- **Media blocks**: Images, videos, drawings
- **Code blocks**: Syntax-highlighted code
- **Interactive blocks**: Polls, embedded quizzes
- **Assignment blocks**: Inline assignment prompts

## Integration Points

- **Block Editor**: Existing `BlockEditor` component works for chapter sections
- **Assignment System**: Enhanced with embedding references
- **Agenda**: Assignments appear based on due dates
- **Progress Tracking**: Completion of chapter sections and assignments
- **AI Generation**: Content can be AI-generated for blocks and assignments

## Migration Considerations

- Existing materials and blocks unchanged
- New features are additive
- Backwards compatible with existing class/assignment workflows

## API Endpoints (Proposed)

- `GET/POST/PUT/DELETE /api/classes/{classId}/chapters`
- `GET/POST/PUT/DELETE /api/classes/{classId}/chapters/{chapterId}/blocks`
- `GET /api/classes/{classId}/chapters/{chapterId}` (with embedded assignments)

This design seamlessly integrates structured learning content while preserving existing functionality and extending the rich content capabilities of Cautie.