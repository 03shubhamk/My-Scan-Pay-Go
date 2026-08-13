# Stitch Design System Mapping

This guide details how Google Stitch visual tokens map to both frontend applications.

---

## 🎨 Color Palette Tokens

| Token Name | Hex Code | Purpose | React Tailwind Class | Flutter Color |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#2563EB` | Main CTAs, active highlights | `bg-blue-600` / `bg-primary` | `Color(0xFF2563EB)` |
| **Primary Hover**| `#1D4ED8` | Hover state for buttons | `hover:bg-blue-700` | `Color(0xFF1D4ED8)` |
| **Secondary** | `#1E293B` | Headers, dark cards | `bg-slate-800` | `Color(0xFF1E293B)` |
| **Background** | `#F8FAFC` | App page background | `bg-slate-50` | `Color(0xFFF8FAFC)` |
| **Surface** | `#FFFFFF` | Card & Modal surfaces | `bg-white` | `Color(0xFFFFFFFF)` |
| **Success** | `#10B981` | Paid badge, Exit Verified | `bg-emerald-500` | `Color(0xFF10B981)` |
| **Warning** | `#F59E0B` | Low stock, pending checkout | `bg-amber-500` | `Color(0xFFF59E0B)` |
| **Danger** | `#EF4444` | Out of stock, error alerts | `bg-red-500` | `Color(0xFFEF4444)` |

---

## 📐 Spacing & Border Radius
- **Card Border Radius**: `16px` (`rounded-2xl` in Tailwind / `BorderRadius.circular(16)` in Flutter)
- **Button Border Radius**: `12px` (`rounded-xl` in Tailwind / `BorderRadius.circular(12)` in Flutter)
- **Container Padding**: `16px` to `24px` standard container gutter.
