# NutriDecode 🥗

NutriDecode is an intelligent nutrition analysis application that helps users make informed decisions about their food choices. By leveraging AI and machine learning, it analyzes food ingredients and provides personalized recommendations based on individual dietary preferences and health goals.

## 🌟 Features

### Core Features
- **Smart Ingredient Analysis**: Advanced analysis of food ingredients using AI
- **Personalized Recommendations**: Tailored suggestions based on dietary preferences
- **Health Score Calculation**: Comprehensive scoring system for nutritional value
- **Allergen Detection**: Automatic identification of potential allergens
- **Sustainability Insights**: Environmental impact assessment of food choices

### User Preferences
- Dietary Restrictions Management
- Health Goals Tracking
- Allergen Alerts
- Nutritional Preferences
- Sustainability Preferences

### Technical Features
- Real-time Analysis
- Secure Authentication
- Data Persistence
- Mobile-Responsive Design
- PDF Report Generation

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - Framer Motion
  - Lucide Icons

- **Backend**:
  - Supabase (Database & Authentication)
  - OpenAI API (Analysis Engine)

- **Development Tools**:
  - ESLint
  - Prettier
  - PostCSS
  - TypeScript

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

## 🚀 Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Decoding-DataScience/Nutridecode-.git
   cd Nutridecode-
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Add your credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_OPENAI_API_KEY=your_openai_api_key
     ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:5173](http://localhost:5173)

## 📦 Project Structure

```
nutridecode/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts
│   ├── pages/          # Page components
│   ├── services/       # API and service integrations
│   └── lib/            # Utility functions and configs
├── public/             # Static assets
└── supabase/          # Database migrations and configs
```

## 🔑 Key Features Explained

### Ingredient Analysis
- AI-powered ingredient breakdown
- Nutritional value assessment
- Allergen identification
- Health impact evaluation

### Personalization
- User preference management
- Dietary restriction handling
- Health goal tracking
- Custom recommendations

### Health Scoring
- Comprehensive nutritional analysis
- Health impact assessment
- Personalized scoring algorithms
- Trend tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI analysis capabilities
- Supabase for the backend infrastructure
- The React community for excellent tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team. 