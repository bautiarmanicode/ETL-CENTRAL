# **App Name**: Data Refinery

## Core Features:

- CSV Upload: CSV Upload: Allows users to upload raw CSV files from Spider and GOSOM.
- Data Consolidation: Data Consolidation: Merges uploaded CSV data into a master CSV, handling field differences between Spider and GOSOM (e.g., 'url' vs 'website'), prioritizing GOSOM data in conflicts.
- Data Deduplication: Data Deduplication: Removes duplicate entries from the consolidated CSV based on 'link' and 'title' fields (if available).
- Chunk Generation: Chunk Generation: Divides the consolidated CSV into smaller chunks based on a user-defined size for lead assignment.
- Log Display: Log Display: Displays execution logs in a text area within the app, aiding in monitoring and troubleshooting.

## Style Guidelines:

- Primary color: Deep purple (#673AB7), reflecting the consolidation and refinement of raw data. The purple alludes to expertise, wisdom and insight.
- Background color: Light grey (#EEEEEE), providing a neutral backdrop that ensures legibility.
- Accent color: Soft violet (#9575CD), used to call attention to key actions and buttons, subtly differing from the primary.
- Headline font: 'Space Grotesk' sans-serif for headlines; suitable for short amounts of body text
- Body font: 'Inter' sans-serif for body text; for readability in reports
- Crisp, geometric icons that align with the data-focused nature of the app.
- Tabbed interface for easy navigation between CSV loading, consolidation, chunking, and logs.