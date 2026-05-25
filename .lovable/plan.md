## Admin Dashboard — Phased Build Plan

আপনার অনুরোধটি অনেক বড় (১৮টি সেকশন, ১০০+ ফিচার)। একসাথে সব বানালে কোড অস্থিতিশীল হবে এবং পরীক্ষা করা যাবে না। আমি ৫টি ফেজে ভাগ করে তৈরি করব — প্রতি ফেজ শেষে আপনি দেখে পরের ফেজে যেতে পারবেন।

বর্তমান অবস্থা:
- ✅ Supabase কানেক্টেড, admin login (`/login`) আছে
- ✅ `activities`, `user_roles` টেবিল + `has_role()` ফাংশন
- ✅ PWA manifest (Android APK ready)

---

### Phase 1 — Dashboard Shell + Core Database (এই ফেজে এখন)

**Database (নতুন টেবিল):**
- `members` — নাম, ফোন, এলাকা, ভূমিকা, স্ট্যাটাস (pending/approved), join_date
- `donations` — donor_name, amount, method (bKash/Nagad/Cash), status, transaction_id, date
- `volunteers` — name, phone, area, assigned_tasks, status
- `events` — title, banner_url, date, location, description, status
- `notices` — title, content (rich text), image_url, published_at
- `help_requests` (ইতিমধ্যে `help_applications` আছে — পুনর্ব্যবহার)
- `gallery_items` — type (photo/video), url, album, event_id
- `app_role` enum এ `moderator` যোগ
- সব টেবিলে RLS: public SELECT (যেখানে দরকার), admin-only write

**Frontend:**
- `/admin` রুট — Sidebar layout (shadcn sidebar), Bangla nav
- Dashboard home — ৬টি stat card (Members, Donations, Volunteers, Events, Pending, Today)
- Red & white theme tokens
- Mobile responsive (sidebar → drawer)
- Route guard: শুধু admin/moderator

### Phase 2 — Members + Donations Management
- Members CRUD, search, filter, approval, CSV export, ID card generator (printable)
- Donations list, approve/reject, status filter, bKash records, receipt PDF download
- Charts (Recharts): monthly donation analytics

### Phase 3 — Events + Volunteers + Notices
- Events: create with banner upload (Supabase Storage), participants, attendance
- Volunteers: register, assign tasks, ranking, attendance
- Notices: rich text editor (Tiptap), image upload, publish

### Phase 4 — Gallery + Help Requests + Reports
- Gallery: album-based photo/video upload
- Help requests admin panel: approve, assign volunteer, status tracking
- Reports: monthly PDF (jsPDF), Excel export (xlsx)

### Phase 5 — Advanced
- Forgot password + OTP (Supabase email OTP)
- Notifications (in-app real-time via Supabase Realtime)
- Settings panel (foundation info, social links, theme)
- Activity logs, session management
- AI chat assistant (Lovable AI Gateway)
- Dark mode, language toggle (Bangla/English)
- QR code verification

---

### ⚠️ গুরুত্বপূর্ণ সিদ্ধান্ত (আপনার নিশ্চিতকরণ দরকার)

**বাদ পড়বে / সীমিত হবে:**
1. **SMS Notifications** — Twilio/SMS gateway লাগবে (পেইড API key)। এখন বাদ, পরে চাইলে যোগ করব।
2. **Email Notifications** — Lovable Email setup করতে হবে (আলাদা ফেজ)।
3. **Push Notifications** — PWA তে browser push সম্ভব; native Android push এর জন্য Firebase লাগবে।
4. **bKash Payment Integration** — শুধু **রেকর্ড রাখা** (manual entry/transaction ID) করব। সরাসরি bKash API integration আলাদা contract লাগে।
5. **Calendar Integration** — Google Calendar API key লাগলে যোগ করব, নাহলে in-app calendar।

### এখন আমি যা শুরু করব:

**Phase 1 শুধু** — database migration + admin sidebar layout + dashboard home + stat cards। এটা শেষ হলে আপনি দেখে বলবেন পরের ফেজে যাব কিনা।

**আপনি কি Phase 1 দিয়ে শুরু করতে অনুমতি দিচ্ছেন?** নাকি প্ল্যানে কিছু পরিবর্তন চান (যেমন ভিন্ন ক্রম, কোনো ফিচার বাদ/যোগ)?
