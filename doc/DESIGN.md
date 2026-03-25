# The Design System: High-End Editorial for Computer Science Education

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Scholar"**

This design system moves away from the cluttered, "marketplace" feel of traditional learning platforms toward a sophisticated, editorial experience. For Computer Science graduates, the environment must mirror the precision of code and the clarity of high-level logic. We achieve this through **Architectural Layering**: using light, shadow, and tonal shifts to create a "Sanctuary of Focus."

Unlike generic platforms, this system rejects the "boxed-in" look. We use intentional white space, subtle background shifts, and high-contrast typography to guide the eye. It is an environment that feels curated, not just populated.

---

## 2. Colors
Our palette is rooted in deep, authoritative purples (`primary`) and clean, expansive surfaces. Teal (`secondary`) acts as a high-precision laser, highlighting only the most critical actions.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through:
- **Background Color Shifts:** Use `surface-container-low` for a sidebar sitting against a `surface` main content area.
- **Tonal Transitions:** Define the header not with a bottom border, but by elevating it to `surface-bright`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to define importance:
1.  **Base Layer:** `surface` (#fbf9f8) – The canvas for the entire application.
2.  **Section Layer:** `surface-container-low` (#f6f3f2) – Used for grouping related content blocks.
3.  **Component Layer:** `surface-container-lowest` (#ffffff) – Used for individual cards or interactive elements to make them "pop" against the section layer.

### The "Glass & Gradient" Rule
To elevate beyond "out-of-the-box" UI, use **Glassmorphism** for floating elements (e.g., sticky navigation or hovering video players). Apply `surface` at 80% opacity with a `20px` backdrop-blur. 
- **Signature Texture:** Primary CTAs should utilize a subtle linear gradient from `primary` (#3e00ab) to `primary_container` (#5624d0) at a 135-degree angle. This adds a "lithographic" depth that flat hex codes cannot replicate.

---

## 3. Typography
We utilize **Inter** to bridge the gap between technical documentation and premium editorial content.

- **Display (lg/md):** Reserved for Hero headers. Use `on_surface` with a tracking of `-0.02em` to create a dense, authoritative "headline" feel.
- **Headline (lg/md/sm):** Used for course titles. These must be bold and unapologetically large to ensure clear content discoverability.
- **Title (lg/md/sm):** Used for module headers. These provide the structural "skeleton" of the curriculum.
- **Body (lg/md):** Optimized for readability in long-form technical descriptions. Line height should be set to 1.6x for `body-lg` to prevent eye fatigue.
- **Label (md/sm):** Specifically for metadata (e.g., "Duration," "Difficulty"). Use `on_surface_variant` to keep these secondary to the main content.

---

## 4. Elevation & Depth
In this design system, elevation is a feeling, not a line.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` section creates a soft, natural lift without the need for heavy shadows.
- **Ambient Shadows:** When a component must "float" (like a Modal or a Dropdown), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(62, 0, 171, 0.04);`. Note the 4% opacity and the subtle purple tint (`primary`) to mimic natural light refraction.
- **The "Ghost Border" Fallback:** If a border is essential for accessibility, use the `outline_variant` token at **15% opacity**. Never use 100% opaque borders; they disrupt the "Architectural Scholar" flow.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `8px` (0.5rem) rounded corners. Text is `on_primary`. 
- **Secondary:** `surface_container_highest` background with `primary` text. No border.
- **Tertiary:** Pure text using `primary` color. High contrast, zero clutter.

### Input Fields
- **Styling:** Avoid traditional boxes. Use `surface_container_high` with a `2px` bottom-only highlight in `primary` when focused.
- **Error State:** Use `error` (#ba1a1a) for the bottom highlight and helper text.

### Cards & Lists
- **Forbid Dividers:** Do not use line-rules between list items. Use `8px` (0.5rem) or `12px` (0.75rem) vertical white space to separate content.
- **Cards:** Use `surface-container-lowest` background on a `surface-container-low` page. Apply the "Ambient Shadow" only on hover to indicate interactivity.

### Progress Indicators (Course Context)
- **Styling:** Use a thick `4px` bar. The track should be `secondary_container` and the progress fill should be `secondary` (#006a6a) to provide a "vibrant" sense of completion.

---

## 6. Do's and Don'ts

### Do
- **Do** use `monospace` sparingly for code snippets or technical IDs to honor the CS graduate's environment.
- **Do** use asymmetrical layouts. For example, a wide `headline-lg` on the left with a small `label-md` metadata block offset to the right.
- **Do** prioritize the `20` (5rem) spacing token for top-level section padding to allow the content to breathe.

### Don't
- **Don't** use pure black (#000000). Always use `on_surface` (#1b1c1c) for text to maintain a premium, "ink-on-paper" feel.
- **Don't** use standard 4px "card shadows." If it's not an Ambient Shadow or a Tonal Shift, it doesn't belong.
- **Don't** use icons as the primary way to communicate. This is a text-first, editorial system; let the typography do the heavy lifting.