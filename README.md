# umami-analytics-react

Integrate Umami analytics in React easily: Use `UmamiProvider` for setup and `useUmami` for custom events/session identification. Page view tracking works automatically by default, or leverage the `useUmamiView` hook for precise control.

[![NPM](https://img.shields.io/npm/v/umami-analytics-react.svg?style=flat-square)](https://www.npmjs.com/package/umami-analytics-react) [![lang](https://img.shields.io/github/languages/top/desw0lf/umami-analytics-react?style=flat-square&color=b141e1&logo=typescript)](#) [![license](https://img.shields.io/github/license/desw0lf/umami-analytics-react?style=flat-square&logo=opensourceinitiative&logoColor=white&color=b141e1)](./LICENSE)

## Features
This library wraps Umami's tracking functionality in a React-friendly API, with support for:
 - ✅ Script loading via `UmamiProvider`

 - 🎯 Custom event tracking and session identification with `useUmami`

 - 📈 Flexible page view tracking options (automatic or hook-based `useUmamiView`)

 - 🧠 Enhanced identity payloads (timezone, theme, etc.)

 - 🕒 Queueing events before the script is ready

## Installation
<a href="https://www.npmjs.com/package/umami-analytics-react"><img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white" alt="npm" align="right"></a>

In your project, install using NPM:

```sh
npm install umami-analytics-react
```

## Usage
### 1. Setup Provider
Wrap your application (or the relevant part of it) with `UmamiProvider`. You must provide your `websiteId`. You can optionally provide the `scriptSrc` if you are self-hosting Umami at a non-standard location.

```jsx
// src/main.tsx or src/index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import { UmamiProvider } from "umami-analytics-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <UmamiProvider
    websiteId="YOUR_UMAMI_WEBSITE_ID"
    // # Optional: If self-hosting or using a different endpoint
    // scriptSrc="https://your-umami-instance.com/script.js"
    // # Optional: Add extra attributes to the script tag
    // scriptAttributes={{ "data-tag": "eu", "data-domains": "example.com,example2.com" }}
  >
    <App />
  </UmamiProvider>
);

```

### 2. Tracking Page Views
Umami offers built-in automatic page view tracking. However, for more precise control, especially within Single Page Applications (SPAs), this library provides the `useUmamiView` hook. Choose the method that best suits your needs.

#### Method 1: Automatic (via Umami script)
This is the default behavior if you do **not** disable it. The standard Umami tracker `script.js` automatically tracks page views based on browser history changes (using the History API).

<details>
<summary>Details</summary>

 - **Pros**: No extra code needed beyond the `UmamiProvider` setup. Works well for traditional multi-page websites.
 - **Cons**: None, unless incompatible with your SPA's routing approach.
 - **How to use**: Simply use the `<UmamiProvider>` **without** setting `data-auto-track` to `false`.
</details>

```jsx
// Uses Umami's built-in automatic tracking
<UmamiProvider websiteId="YOUR_UMAMI_WEBSITE_ID">
  <App />
</UmamiProvider>
```

<details>
<summary><h4>Method 2: Custom - Automatic via Hook (e.g. using a router)</h4></summary>
This method gives you fine-grained control over _when_ a page view is tracked, suitable for SPAs using libraries like React Router.
It requires **disabling** the default Umami script auto-tracking.
<br/><br/>

<details>
<summary>Details</summary>

 - **Pros**: Reliable tracking aligned with your application's routing logic. Tracks views exactly when your components signal a navigation change. Can track custom event data alongside the view.
 - **Cons**: Requires adding the `useUmamiView` hook in your code.
 - **How to use**:
    1. Disable default tracking by adding `scriptAttributes={{ "data-auto-track": false }}` to your `<UmamiProvider>`.
    2. Call `useUmamiView` in a component that renders across all routes (like your main `App` or a layout component).
    3. Pass values that change with navigation (e.g., `location.pathname`, `location.search`) to its dependency array (`viewDependencies`).
    4. **(Optional)** Provide a payload (object or mapper function) as the second argument to track specific event data when the dependencies change. If no payload is provided, it defaults to tracking a standard page view.
</details>

```jsx
// Example using React Router
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import { useUmamiView, UmamiProvider } from "umami-analytics-react";

// A component rendered within the Router context that has access to location
function LocationTracker() {
  const location = useLocation();

  // Track view whenever pathname or search params change
  useUmamiView([location.pathname, location.search]);

  // Or track only when pathname changes
  // useUmamiView([location.pathname]);

  // Or track a specific event with data when the pathname changes
  // useUmamiView(
  //   [location.pathname], // Dependencies
  //   (props) => ({ ...props, title: "Overwrite title" })
  // );

  // This component doesn't need to render anything itself,
  // or it could be part of your main layout.
  return null;
}

// Your page components
const HomePage = () => <div>Home</div>;
const AboutPage = () => <div>About</div>;

function App() {
  return (
    // *** Disable default tracking ***
    <UmamiProvider
      websiteId="YOUR_UMAMI_WEBSITE_ID"
      scriptAttributes={{ "data-auto-track": false }} // <-- Important!
    >
      <BrowserRouter>
        {/* Place the tracker component inside the Router */}
        <LocationTracker />

        {/* Your usual Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* ... other routes */}
        </Routes>
      </BrowserRouter>
    </UmamiProvider>
  );
}
```
</details>

<details>
<summary><h4>Method 3: Custom - Manual via Hook (Per Page / Component Mount)</h4></summary>
This method allows you to explicitly trigger a page view track when a specific component mounts.
It also requires **disabling** the default Umami script auto-tracking.
<br/><br/>

<details>
<summary>Details</summary>

 - **Pros**:
    1. **Explicit Control**: Track views precisely when specific components mount.
    2. **Selective Tracking**: Useful if you only want to track views for a small subset of pages/components.
    3. **Flexible**: Can track views/events for UI states not tied directly to route changes (e.g., opening a significant modal). Can include custom data.
 - **Cons**: Requires adding the `useUmamiView` hook to every component you want to track individually.
 - **How to use**:
    1. Disable default tracking by adding `scriptAttributes={{ "data-auto-track": false }}` to your `<UmamiProvider>`.
    2. Call `useUmamiView` without any dependencies inside each component that represents a trackable page or view.
    3. **(Optional)** Provide a payload (object or mapper function) as the second argument to track specific event data on mount. If no payload is provided, it defaults to tracking a standard page view.
</details>

```jsx
// Example: src/components/ImportantModal.tsx
import { useUmamiView } from "umami-analytics-react";

function ImportantModal({ modalId }: { modalId: string }) {
  // Track view once when this modal component mounts, include modalId
  useUmamiView([], (props) => ({ ...props, eventName: "modal-view", modalId: modalId }));

  // Or track a standard page view on mount
  // useUmamiView();

  return <div>Modal Content...</div>;
}
export default ImportantModal;

// Make sure this component is rendered within the UmamiProvider
// context, and that the provider has data-auto-track set to false.

```
</details>


### 3. Tracking Custom Events
Use the `useUmami` hook to get access to the `track` function.
```jsx
import { useUmami } from "umami-analytics-react";

function MyComponent() {
  const { track } = useUmami();

  const handleSignup = () => {
    // Track simple event by name
    track("signup-button-click");

    // Track event with a custom payload
    track("newsletter-subscribe", { plan: "premium" });
  };

  // Track using a function (useful for dynamic properties)
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    track((props) => ({
      ...props, // Includes default properties like url, referrer
      event: "button-click",
      buttonId: event.currentTarget.id,
    }));
  };

  return (
    <div>
      <button onClick={handleSignup}>Sign Up</button>
      <button id="main-cta" onClick={handleButtonClick}>
        Main CTA
      </button>
    </div>
  );
}
```

### 4. Identifying Sessions
Use the `useUmami` hook to get access to the `identify` function. This allows you to associate custom data with the current user"s session.
```jsx
import { useUmami } from "umami-analytics-react";

function UserProfile() {
  const { identify, generateEnhancedIdentity } = useUmami();

  const handleLogin = (userId: string, role: string) => {
    // Identify the user with custom data
    identify(userId, { role });
  };

  const identifyWithEnhancedData = () => {
    // Identify with custom data AND automatically appended browser/device info
    // (timezone, theme, reduced motion preference, touch device, connection type)
    identify({ ...generateEnhancedIdentity(), customData: "example" });
  };

  const identifyWithSpecificEnhancedData = () => {
    // Identify with custom data AND only specific enhanced info
    identify({ ...generateEnhancedIdentity(["timezone", "systemTheme"]), customData: "example" });
  };

  return (
    <div>
      {/* ... login form ... */}
      <button onClick={() => handleLogin("user-123", "admin")}>Log In</button>
      <button onClick={identifyWithEnhancedData}>Identify (Enhanced)</button>
      <button onClick={identifyWithSpecificEnhancedData}>
        Identify (Specific Enhanced)
      </button>
    </div>
  );
}
```

**Enhanced Identify Properties:**

When using `generateEnhancedIdentity` helper function, the following properties (if available) can be added:

- timezone: _e.g., `"Europe/London"`_
- timezoneOffset: _e.g., `60`_
- ect: Effective connection type, _e.g., `"4g"`_  ( [?](https://developer.mozilla.org/en-US/docs/Glossary/Effective_connection_type) )
- systemTheme: `"light"` or `"dark"`
- prefersReducedMotion: `true` or `false`
- isTouchDevice: `true` or `false`
- zoomLevel: _e.g., `100`_

<details>
<summary><h3>5. Manual Script Loading</h3></summary>

If you prefer to control exactly when the Umami script loads, set `autoLoad={false}` on the `UmamiProvider` and call the `register` function obtained from `useUmami` when ready.

```jsx
import { UmamiProvider, useUmami } from "umami-analytics-react";
import { useState, useEffect } from "react";

function ManualLoadTrigger() {
  const { register } = useUmami();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      console.log("Registering Umami script...");
      register(); // You can optionally pass config here too
    }
  }, [shouldLoad, register]);

  return (
    <button onClick={() => setShouldLoad(true)} disabled={shouldLoad}>
      Load Umami Analytics
    </button>
  );
}

function App() {
  return (
    <UmamiProvider websiteId="YOUR_UMAMI_WEBSITE_ID" autoLoad={false}>
      {/* ... rest of your app */}
      <ManualLoadTrigger />
    </UmamiProvider>
  );
}
```
</details>

## API
### `<UmamiProvider />`
The provider component that enables Umami tracking within its children.

**Props:**

 - `websiteId: string`: (Required) Your Umami website tracking ID.

 - `scriptSrc?: string`: URL of the Umami tracker script. Defaults to `https://cloud.umami.is/script.js`.

 - `scriptAttributes?: object`: Additional attributes to add to the script tag (e.g., `data-tag`, `data-domains`). See [Umami Docs (tracker configuration)](https://umami.is/docs/tracker-configuration). _(`data-website-id` is handled internally_).

 - `autoLoad?: boolean`: Whether to load the script automatically on mount. Defaults to `true`.

 - `children: React.ReactNode`: Your application components.

 ### `useUmami()`
 Hook to access the core Umami tracking functions and context. See [Umami Docs (tracker functions)](https://umami.is/docs/tracker-functions). Must be used within an `<UmamiProvider />`.

 **Returns: `object`**

 - `track: (eventNameOrPayload, payload?) => void`: Tracks a custom event.
 
 - `identify: (payloadOrUniqueId, payload?) => void`: Associates data with the current session. `appendEnhancedPayload` can be `true` to add all enhanced data, or an array of specific keys (`'timezone'`, `'systemTheme'`, etc.).

 - `view: () => void`: Tracks a page view. Usually called automatically by `useUmamiView`. _(Internally calls `track()`)_.

 - `register: (config?) => void`: Manually triggers the loading of the Umami script. Can optionally override provider config (`websiteId`, `scriptSrc`, `scriptAttributes`). Only needed if `autoLoad={false}`.

 - `umamiRef: RefObject<Umami | null>`: A React ref containing the loaded `window.umami` object, or `null` if not loaded yet. Use with caution.

### `useUmamiView(viewDependencies?, payload?)`
Hook to simplify tracking events (typically page views) based on dependency changes or component mount. Essentially wraps a call to `track()` within a `useEffect`. Requires `data-auto-track="false"` on the provider if used for page view tracking to avoid duplicates.

**Arguments:**

 - `viewDependencies: ReadonlyArray<unknown>`: (Optional) A dependency array. When any value in this array changes, the effect runs and `track(payload)` is called. If omitted or empty (`[]`), the effect runs only once on component mount. Defaults to `[]`.

 - `payload?`: (Optional) The payload to pass to the underlying track function when the effect runs. This can be:
   - An event data object (e.g., `{ eventName: 'signup', step: 1 }`).
   - A mapper function that receives default properties and returns an event data object.
   - If omitted, a standard page view is tracked (equivalent to calling `track()` with no arguments).

 ### `generateEnhancedIdentity()`
 Helper function which generates some basic additional enhanced payload for the `identify` method. Has the ability to filter which values to include (`'timezone'`, `'systemTheme'`, etc.). Example: `identify("john@sampleemail.com", { ...generateEnhancedIdentity(), myOtherCustom: "blue" })`


## License

Distributed under the ISC License. See [LICENSE](./LICENSE) for more information.