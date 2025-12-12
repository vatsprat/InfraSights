# InfraSights 🔮

**Predict your cloud bill before you build.**

InfraSights is an AI-powered cloud architecture analyzer. It uses Google's Gemini 3 Pro model to visually parse architecture diagrams, identify services, ask clarifying questions about traffic and usage, and generate professional cost estimates with optimization recommendations.

![InfraSights Preview](https://via.placeholder.com/1200x600/18181b/a78bfa?text=InfraSights+Dashboard)

## ✨ Key Features

- **Visual Architecture Parsing**: Upload any cloud diagram (AWS, GCP, Azure). The AI identifies components, connections, and patterns automatically.
- **Smart Context Gathering**: The system asks 3-5 specific, high-impact questions based on *your* specific architecture to refine cost accuracy.
- **Interactive Questionnaire**: Hybrid UI allowing quick tag selection or custom text input for workload details.
- **Detailed Cost Reporting**:
  - Monthly & Annual estimates.
  - Confidence scoring and variance ranges (Optimistic vs. Peak).
  - Service-by-service breakdown.
- **Actionable Optimizations**: AI-generated recommendations to lower costs (e.g., Spot instances, Lifecycle policies) categorized by impact.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (Zinc/Violet/Emerald "Cyber-Professional" theme)
- **AI Integration**: Google Gemini API (`@google/genai`) - Model: `gemini-3-pro-preview`
- **Visualization**: Recharts (Interactive Pie Charts)
- **Icons**: Lucide React
- **Build**: Vite/Parcel (Assumed based on module structure)

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: v18 or higher.
2. **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infrasights.git
   cd infrasights
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variable:
   Create a `.env` file in the root directory and add your API key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```
   *Note: Ensure your build tool (Vite/Webpack) is configured to expose this key as `process.env.API_KEY`.*

4. Run the development server:
   ```bash
   npm start
   # or
   npm run dev
   ```

## 📖 Usage Guide

1. **Upload Stage**:
   - Drag & drop your architecture diagram image.
   - (Optional) Add context tags like "High Traffic" or "B2B SaaS" to give the AI a head start.
   - Click **Analyze Architecture**.

2. **Clarification Stage**:
   - Review the AI's identified components (optional).
   - Answer the generated questions. You can click the suggested tags or type your own specifics.
   - Click **Calculate Estimates**.

3. **Report Stage**:
   - View the Total Monthly Cost.
   - Read the Executive Summary.
   - Review high-impact Recommendations to save money.
   - Check the detailed breakdown table and charts.

## 📂 Project Structure

- `src/services/geminiService.ts`: Handles interaction with Google Gemini API (Vision analysis & JSON generation).
- `src/components/CostVisualization.tsx`: Recharts implementation for cost breakdowns.
- `src/components/MarkdownRenderer.tsx`: Custom renderer for AI-generated text.
- `src/constants.ts`: System prompts and JSON schemas for the AI.
- `src/types.ts`: TypeScript interfaces for the application state.
- `src/App.tsx`: Main application logic and UI orchestration.

## 🛡️ License

This project is licensed under the MIT License.