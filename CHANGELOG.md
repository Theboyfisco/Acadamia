# Changelog

## [Unreleased] - YYYY-MM-DD
### Fixed
- Resolved multiple TypeScript errors across the project.
- **Schema Refactoring:**
  - Moved `ParentSchema` definition from `src/components/forms/ParentForm.tsx` to `src/lib/formValidationSchemas.ts`.
  - Defined `ParentSchema` using Zod in `formValidationSchemas.ts` for consistency and added relevant validation rules.
  - Updated `ParentForm.tsx` and `src/lib/actions.ts` to import `ParentSchema` from its new centralized location.
- **Type Imports & Definitions:**
  - Ensured the `User` type from Clerk is correctly imported in `src/lib/actions.ts` (from `@clerk/nextjs/server`).
- **Action Signatures & Calls:**
  - In `src/components/forms/ParentForm.tsx`: Corrected calls to `createParent` and `updateParent` server actions to pass the required two arguments, including a default `CurrentState` object, resolving an argument count mismatch.
- **Prisma Input Type Mismatches in `src/lib/actions.ts`:**
  - `createLesson`: Added missing `day`, `startTime`, and `endTime` fields to the data object for `prisma.lesson.create` to match `LessonUncheckedCreateInput` type.
  - `createParent` & `updateParent`: Removed the `img` property from data passed to `prisma.parent.create` and `prisma.parent.update` as it's not part of the Prisma model input types.
- **Optional Property Handling in `src/lib/actions.ts`:**
  - `createSubject` & `updateSubject`: Added safety checks for `data.teachers` (using `(data.teachers || [])`) before mapping to prevent runtime errors if the property is undefined.
- **Variable Scoping in `src/lib/actions.ts`:**
  - `createParent`: Corrected the scope of the `clerkUser` variable to ensure it's accessible in the `catch` block for proper error handling and rollback of Clerk user creation if database insertion fails.



All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created initial changelog file to track project changes
- Added theme switching functionality:
  - Created ThemeContext for managing theme state
  - Added theme toggle button in navbar
  - Implemented system theme detection
  - Added theme persistence using localStorage
  - Added dark mode support throughout the application
- Added user data API endpoint for client-side user information
- Dark mode support for all list pages
- Consistent theme styling across tables and lists
- Proper light/dark mode transitions for all components
- Created placeholder ParentForm component file (`src/components/forms/ParentForm.tsx`)
- Added LessonForm component file (`src/components/forms/LessonForm.tsx`)
- Added lesson Zod schema in `src/lib/formValidationSchemas.ts`
- Added CustomDropdown component (`src/components/CustomDropdown.tsx`) with theme-aware styling and accessibility features
- Added @heroicons/react package for UI icons

### Changed
- Enhanced sign-in page UI with:
  - Split layout design (welcome section + sign-in form)
  - Improved form design with better spacing and typography
  - Added "Remember me" checkbox
  - Added "Forgot password" link
  - Enhanced input field styling with focus states
  - Better error message styling
  - Responsive design for mobile and desktop
  - Improved accessibility features

- Improved overall application UI:
  - Enhanced dashboard layout with modern sidebar design
  - Improved navbar with better search bar and user section
  - Redesigned menu with better spacing and hover effects
  - Added smooth transitions and hover states
  - Improved typography and color scheme
  - Better responsive design for all screen sizes
  - Enhanced accessibility with proper ARIA labels
  - Added visual feedback for interactive elements
  - Added dark mode support for all components:
    - Updated color schemes for dark mode
    - Added dark mode styles for text, backgrounds, and borders
    - Improved contrast ratios for better readability
    - Added smooth theme transitions

- Updated table row styling for better visibility in both light and dark modes
  - Light mode: 
    - Border color: `border-gray-200`
    - Text color: `text-gray-700`
    - Hover background: `hover:bg-gray-100`
  - Dark mode:
    - Border color: `dark:border-gray-700`
    - Text color: `dark:text-gray-200`
    - Hover background: `dark:hover:bg-gray-700/50`
- Updated container backgrounds from `bg-white` to `bg-gray-800` in list pages (Note: Table background is handled within the Table component)
- Modified button styles to use `bg-gray-700` with hover effects transitioning to `bg-gray-600`
- Added `invert` class to button images for better visibility in dark mode
- Updated text colors for better contrast in both modes
  - Headers: `text-white`
  - Secondary text: `text-gray-500 dark:text-gray-400`
- Ensured consistent table styling across all list pages:
  - Updated Results page to match the new theme
  - Updated Lessons page to match the new theme
  - Standardized row styling across all tables
  - Unified button styling and hover effects
  - Consistent text colors and contrast ratios
- Implemented basic ParentForm structure:
  - Added input fields for name, surname, email, phone, and address
  - Integrated react-hook-form with Zod validation schema
  - Configured form to pre-populate with existing parent data for updates
  - Styled form similar to the StudentForm
- Added password field to ParentForm:
  - Included password input field in the Authentication Information section
  - Updated Zod validation schema to make password required for creation but optional for update
  - Conditionally rendered the password field only for create forms
- Improved ParentForm styling and interactivity:
  - Enhanced form container styling with background, rounded corners, and shadow
  - Implemented a responsive grid layout for input fields
  - Added section separators and styled titles
  - Updated submit and cancel button styling for consistency and hover effects
  - Added placeholder text to input fields
  - Improved overall layout, spacing, and typography
- Further refined ParentForm styling:
  - Enhanced form container padding, border radius, and shadow
  - Improved main title styling with larger text, bold font, and a more prominent separator
  - Adjusted spacing within sections and between the last section and buttons
- Made input fields in ParentForm wider:
  - Applied `w-full` class to all InputField components within the grid layout
  - Improved the visual balance and appearance of the form by making inputs fill their columns

### Fixed
- Fixed logout functionality by:
  - Creating proper logout route handler
  - Implementing Clerk's SignOutButton component
  - Correcting import statements for Clerk components
- Fixed Menu component:
  - Restored server-side functionality
  - Fixed user data handling
  - Improved dark mode support
- Fixed Navbar component:
  - Added proper error handling for user data fetching
  - Improved theme toggle functionality
  - Enhanced dark mode support 
- Fixed Table component background color not changing with theme:
  - Removed conflicting background styling from the Table component wrapper div
  - Ensured background color is controlled by the main container in list pages for proper theme application
  - Fixed background color transitions
- Fixed inconsistent table styling:
  - Removed old color schemes (lamaYellow, lamaPurpleLight)
  - Standardized hover effects and transitions
  - Ensured proper dark mode support across all tables
- Fixed admin edit/delete buttons not visible in list pages:
  - Updated user role access logic to correctly read role from Clerk session claims (`sessionClaims?.o?.rol`)
  - Applied fix to all list page components to ensure proper conditional rendering of admin-only buttons
- Fixed TypeError in FormModal when adding a parent:
  - Added dynamic import for the ParentForm component
  - Added missing entry for 'parent' in the forms object within FormModal.tsx
  - Ensured the correct form component is loaded when adding or updating parent data
- Improved InputField styling for better dark mode appearance:
  - Updated background, border (ring), and text colors of the input element to include dark mode variants
  - Ensured labels also have appropriate dark mode text colors
  - Made input fields look more integrated with dark backgrounds

### Affected Components
- Table component
- TableSearch component
- List pages:
  - Students
  - Teachers
  - Parents
  - Subjects
  - Assignments
  - Exams
  - Events
  - Announcements
  - Results
  - Lessons

### Technical Details
- Implemented consistent class naming across components
- Added proper dark mode variants for all color utilities
- Ensured smooth transitions between light and dark modes
- Maintained accessibility standards for text contrast
- Preserved existing functionality while updating styles

## [Next Steps]
- Monitor and adjust contrast ratios if needed
- Consider adding theme toggle functionality
- Review and optimize performance of theme transitions
- Add automated tests for theme-related functionality 