# Sidebar Component

The Sidebar component provides navigation for the TradeMaster dashboard application.

## Features

- **User Profile Display**: Shows authenticated user's name, email, and avatar
- **Navigation Items**: Home, Settings navigation
- **Logout Action**: Secure sign-out functionality
- **Responsive Design**: Adapts to different screen sizes
- **Active State**: Highlights current page

## Navigation Items

1. **Home** (`/dashboard/home`) - Dashboard home page
2. **Settings** (`/dashboard/settings`) - User profile and account settings
3. **Logout** - Signs out user and redirects to signin page

## Usage

```tsx
import { Sidebar } from '../../components';

<DashboardLayout>
  <Sidebar />
  <MainContent />
</DashboardLayout>
```

## Responsive Behavior

- **Desktop**: Fixed sidebar at 280px width
- **Tablet**: Reduced to 260px width
- **Mobile**: Full-width overlay (hidden by default)

## Styling

The component follows TradeMaster's design system with:
- Clean, modern interface
- Consistent color scheme
- Smooth transitions and hover effects
- Accessibility-focused interactions