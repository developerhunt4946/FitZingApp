# FitZing App - Production Ready Setup Guide

Welcome to your production-ready React Native app! This app is built with modern standards for state management, navigation, and API integration.

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.jsx       # Pressable button with variants
│   ├── CustomTextInput.jsx  # Text input with validation
│   ├── Container.jsx    # Safe area container
│   └── Card.jsx         # Card wrapper component
├── navigation/          # Navigation setup
│   ├── RootNavigator.jsx   # Main navigation logic (handles auth check)
│   ├── AuthStack.jsx       # Authentication screens stack
│   └── AppStack.jsx        # App screens with bottom tab navigation
├── redux/               # State management
│   ├── actions/
│   │   ├── types.js     # Action type constants
│   │   └── authActions.js  # Auth-related actions
│   ├── reducers/
│   │   └── authReducer.js  # Auth state reducer
│   └── store.js         # Redux store configuration
├── screens/             # Screen components
│   ├── LoginScreen.jsx  # User login screen
│   ├── SignUpScreen.jsx # User registration screen
│   └── HomeScreen.jsx   # App home screen
├── services/            # API and external services
│   ├── apiClient.js     # Axios instance with interceptors
│   └── api.js           # API endpoint definitions
├── theme/               # Centralized styling
│   ├── colors.js        # Color palette
│   ├── fonts.js         # Typography styles
│   ├── spacing.js       # Spacing scale
│   └── index.js         # Theme exports
└── utils/               # Helper functions and constants
    ├── helpers.js       # Utility functions
    ├── constants.js     # App constants
    └── index.js         # Utils exports
```

## 🔑 Key Features

### 1. **Redux State Management** (`src/redux/`)
- Centralized state management using Redux
- Auth reducer for managing user login state
- Redux Thunk for async actions
- Easy to extend with more reducers

### 2. **Persistent Login** (Auto-login on app restart)
- Uses `AsyncStorage` to save auth token and user data
- `RootNavigator` checks for saved credentials on app launch
- Automatic navigation to app or auth screens based on auth state
- Token automatically attached to API requests

### 3. **Navigation Structure** (`src/navigation/`)
- **RootNavigator**: Main entry point, handles auth state
- **AuthStack**: Login and Sign Up screens (shown when not authenticated)
- **AppStack**: Home, Profile, Settings tabs (shown when authenticated)
- Clean conditional rendering based on auth state

### 4. **Bottom Tab Navigation**
Three tabs in the app:
- 🏠 **Home**: Main dashboard
- 👤 **Profile**: User profile (ready to implement)
- ⚙️ **Settings**: Settings (ready to implement)

### 5. **API Integration** (`src/services/`)
- Axios client with automatic token injection
- Base URL configuration
- Request/response interceptors
- Structured API endpoints
- 401 error handling for expired tokens

### 6. **Centralized Theme System** (`src/theme/`)
- **Colors**: 40+ predefined colors for consistency
- **Fonts**: Font sizes, weights, and typography styles
- **Spacing**: Consistent spacing scale
- Easy to maintain and scale across the app

## 🚀 Getting Started

### 1. Update API Base URL
Edit `src/services/apiClient.js`:
```javascript
const API_BASE_URL = 'https://your-api-endpoint.com';
```

### 2. Implement Your API Endpoints
Edit `src/services/api.js` and add your endpoints:
```javascript
export const customAPI = {
  getUsers: () => apiClient.get('/users'),
  createPost: (data) => apiClient.post('/posts', data),
  // Add your endpoints...
};
```

### 3. Create Redux Actions for Your APIs
Create new action files in `src/redux/actions/` for each feature:
```javascript
export const fetchUsers = () => (dispatch) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await userAPI.getUsers();
    dispatch({ type: 'SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'ERROR', payload: error.message });
  }
};
```

### 4. Add New Screens
Create new screen files in `src/screens/` and add them to navigation stacks.

### 5. Create Reusable Components
Add new components in `src/components/` with consistent styling using the theme.

## 📝 Authentication Flow

### Login Flow:
1. User enters email and password
2. App calls API login endpoint
3. API returns token and user data
4. Token and user data saved to AsyncStorage
5. Redux state updated with user info
6. Navigation automatically switches to AppStack

### Persistent Login:
1. App launches
2. RootNavigator checks AsyncStorage for token
3. If token exists, user data restored to Redux
4. User stays logged in without re-login
5. If token expired (401), user redirected to login

### Logout Flow:
1. User taps logout
2. Redux state cleared
3. AsyncStorage cleared
4. Navigation switches back to AuthStack

## 🎨 Using the Theme System

### Colors
```javascript
import { COLORS } from './src/theme';

<View style={{ backgroundColor: COLORS.primary }}>
  <Text style={{ color: COLORS.text }}>Hello</Text>
</View>
```

### Fonts
```javascript
import { FONTS } from './src/theme';

<Text style={FONTS.heading1}>Large Title</Text>
<Text style={FONTS.body1}>Regular text</Text>
<Text style={FONTS.caption}>Small text</Text>
```

### Spacing
```javascript
import { SPACING } from './src/theme';

<View style={{ padding: SPACING['16'], marginBottom: SPACING['8'] }}>
  Content
</View>
```

## 🔗 Using Reusable Components

### Button
```javascript
import { Button } from './src/components';

<Button
  title="Login"
  onPress={handleLogin}
  variant="primary"  // primary, secondary, outline
  size="lg"          // sm, md, lg
  loading={isLoading}
  disabled={isLoading}
/>
```

### Custom Text Input
```javascript
import { CustomTextInput } from './src/components';

<CustomTextInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={emailError}
/>
```

### Container
```javascript
import { Container } from './src/components';

<Container scroll centerContent>
  {/* Your content */}
</Container>
```

### Card
```javascript
import { Card } from './src/components';

<Card style={{ marginBottom: 16 }}>
  {/* Your card content */}
</Card>
```

## 📡 Making API Calls

### Example in a Screen:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './src/services/api';

const MyScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const fetchData = async () => {
    try {
      const response = await authAPI.getUserProfile();
      // Use response data
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your component JSX
  );
};
```

## 🔐 Security Best Practices

1. **Never store sensitive data** in Redux state only
2. **Always use AsyncStorage** with encryption key for tokens
3. **Implement token refresh** logic in apiClient interceptors
4. **Validate user input** before sending to API
5. **Handle 401 responses** by clearing auth and redirecting to login
6. **Use HTTPS only** for all API calls in production

## 🎯 Next Steps

1. ✅ Replace sample screens with your actual screens
2. ✅ Update API endpoints in `src/services/api.js`
3. ✅ Create Redux actions/reducers for your features
4. ✅ Add more screens and navigation as needed
5. ✅ Customize theme colors and fonts to match your brand
6. ✅ Implement additional tabs/stacks in navigation

## 📚 Useful Utilities

Helpers available in `src/utils/`:
- `formatDate()` - Format dates
- `validateEmail()` - Validate email format
- `truncateText()` - Truncate text
- `getInitials()` - Get name initials
- `formatCurrency()` - Format currency values

## 🚨 Common Issues & Solutions

### Issue: Navigation doesn't update on login
**Solution**: Ensure Redux state is properly updated and token is saved to AsyncStorage.

### Issue: API requests fail silently
**Solution**: Check API base URL in `apiClient.js` and ensure endpoints are correct.

### Issue: Component styles not applying
**Solution**: Always use theme values (`COLORS`, `FONTS`, `SPACING`) instead of hardcoded values.

### Issue: AsyncStorage data not persisting
**Solution**: Ensure `.clearAsyncStorage()` is not called unexpectedly. Check Android/iOS permissions.

## 📞 Support

For more information:
- React Native: https://reactnative.dev
- Redux: https://redux.js.org
- React Navigation: https://reactnavigation.org
- Axios: https://axios-http.com

Happy coding! 🚀
