# **App Name**: ColorCanvas

## Core Features:

- User Authentication & Profiles: Secure email/password signup and login, with robust validation. User profiles (username, email, profileImage, bio) are stored and managed in Firestore.
- Artwork Upload & Storage: Allows users to upload images to Firebase Storage, add a title and description, and preview before publishing. Post data, including an image URL, is saved to Firestore. Validates file types and sizes.
- AI-Powered Tag Suggestion: During artwork upload, an AI tool automatically suggests relevant tags or categories based on the image content to streamline organization.
- Homepage & Explore Galleries: A dynamic homepage featuring a clean hero section, selected artwork, and a scrollable grid of the latest uploads. The Explore page offers a searchable grid-based layout for discovering artworks.
- Personalized User Profile Page: A dedicated page for each user displaying their profile image, username, bio, and a grid gallery of all their uploaded posts.
- Interactive Liking System: Users can like artworks, which increments a 'likesCount' in Firestore and provides real-time updates on the UI.
- Responsive Global Navigation: A top-level navigation bar provides consistent access to Home, Explore, Upload, Profile, and dynamic Login/Logout links, fully responsive across all devices.

## Style Guidelines:

- Background color: A soft, calming sky blue (#D8ECF7) to create a clean and expansive feel.
- Primary color: An elegant, light silver/grey (#D1D5DB) providing a sophisticated yet minimal aesthetic for main UI elements.
- Accent color: A vibrant, clear blue (#1A70ED) used for Call-to-Action buttons and key interactive elements, ensuring strong visibility.
- Text color: Classic black (#000000) for high readability and a clean contrast against lighter backgrounds.
- Headline font: 'Poppins' (sans-serif) for its modern, precise, and contemporary feel in headings and shorter UI texts.
- Body text font: 'Inter' (sans-serif) for excellent readability in longer paragraphs and descriptive content, maintaining a clean and neutral look.
- Use a set of minimal, outline-style icons to maintain a clean and elegant visual consistency throughout the application.
- Implement grid-based layouts for content display (e.g., artwork galleries), ensuring proper spacing, no clutter, and generous margins for an open feel. Prioritize mobile-first responsiveness.
- Subtle and smooth transitions for state changes and content loading (e.g., image loading, button hovers) to enhance user experience without being distracting.