# KULT NETWORK // SEO & BLOG UPGRADE (NOCODB EDITION)

This upgrade transforms KULT into a production-level, SEO-optimized intelligence platform using your existing NocoDB infrastructure.

## 📦 NEW FEATURES
1. **Intelligence Feed**: Integrated Blog system running directly on NocoDB.
2. **SEO Landing Pages**: Three high-octane pages optimized for Google ranking.
3. **Dynamic Meta Tags**: Automated control over Page Title, Descriptions, and Canonical URLs.
4. **Sitemap Protocol**: Automated generation at `https://kultnetwork.in/sitemap.xml`.
5. **Admin Terminal**: Secure blog deployment interface at `/admin/blog`.

## 🛠️ NOCODB SETUP

1. **Create Table**: Create a table named **`Blogs`** in NocoDB.
2. **Add Columns**:
   - `Title` (Single Line Text)
   - `Content` (Long Text / Markdown)
   - `Description` (Long Text)
   - `Keywords` (Single Line Text)
   - `Slug` (Single Line Text)
   - `Image` (Single Line Text)

## 🛠️ LOCAL SETUP

### 1. Environment Configuration
Update your `.env` in `/backend`:
```env
TABLE_ID_BLOGS=your_new_blogs_table_id
```

### 2. Frontend Dependencies
Run in `/frontend`:
```bash
npm install react-helmet-async react-markdown slugify
```

### 3. Execution
Start the engines:
- Backend: `npm start`
- Frontend: `npm run dev`

## 📈 SEO MONITORING
- Access sitemap at: `http://localhost:5001/sitemap.xml`
- Access Blog Feed: `http://localhost:5173/blog`
- Access Admin Terminal: `http://localhost:5173/admin/blog` (Supervisor Access Only)
