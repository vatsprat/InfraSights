# ☁️ CloudCost AI — Architecture Cost Estimator

> **Upload your architecture diagram → Get instant cost estimates + senior architect recommendations**

Built for the [Kaggle Gemini 3 Pro Hackathon](https://www.kaggle.com/competitions/gemini-3/) (Dec 5-12, 2025)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%203%20Pro-orange)
![Status](https://img.shields.io/badge/status-hackathon%20submission-green)

---

## 🎯 Problem Statement

Cloud architects and developers sketch infrastructure on whiteboards, Excalidraw, draw.io, or Lucidchart — but **have no idea what it'll cost** until they actually deploy and get the bill.

- Cost estimation is manual, tedious, and often skipped
- Hidden costs (data transfer, NAT gateways, API calls) surprise teams
- 40-70% of cloud spending is typically wasted on over-provisioned resources

**CloudCost AI solves this by turning any architecture diagram into an instant, detailed cost breakdown with optimization recommendations.**

---

## ✨ Features

### 🔍 Smart Diagram Parsing
- Supports hand-drawn whiteboard photos, screenshots, PDFs
- Identifies AWS/GCP/Azure services automatically
- Understands connections and data flow between components

### 💬 Intelligent Follow-up Questions
- Asks only high-impact questions (compute sizing, traffic, storage)
- Multiple choice format for faster responses
- Prioritizes questions by cost impact

### 💰 Detailed Cost Breakdown
- Per-service monthly cost estimates
- Includes hidden costs (data transfer, NAT, API calls, CloudWatch)
- Low/Expected/High cost ranges
- Annual projections

### 🏗️ Senior Architect Recommendations
- Identifies cost risks and anti-patterns
- Quick wins with effort/savings tradeoffs
- Multi-cloud cost comparison
- "What if" scenario modeling

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Gemini 3 Pro API access ([Get API key](https://aistudio.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cloudcost-ai.git
cd cloudcost-ai

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### Usage

```bash
# Run the app
python app.py

# Or use the CLI
python cli.py --image architecture.png --context "E-commerce platform, 50K daily users"
```

---

## 📁 Project Structure

```
cloudcost-ai/
├── app.py                  # Main application entry point
├── cli.py                  # Command-line interface
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
│
├── prompts/
│   ├── system_prompt.md    # Base system prompt
│   ├── stage1_parsing.md   # Diagram parsing prompt
│   ├── stage2_questions.md # Follow-up question generation
│   └── stage3_estimate.md  # Cost estimation + recommendations
│
├── pricing/
│   ├── aws_pricing.json    # AWS service pricing data
│   ├── gcp_pricing.json    # GCP service pricing data
│   └── azure_pricing.json  # Azure service pricing data
│
├── tests/
│   ├── test_diagrams/      # Sample architecture diagrams
│   │   ├── 3tier_ecommerce.svg
│   │   ├── serverless_processing.svg
│   │   └── eks_microservices.svg
│   └── test_cases.py       # Unit tests
│
└── docs/
    ├── PROMPT_SYSTEM.md    # Complete prompt documentation
    └── DEMO_SCRIPT.md      # Demo video script
```

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        User Input                           │
│   📸 Architecture Diagram + 📝 Business Context             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 1: Diagram Parsing                       │
│   • Identify all cloud services                             │
│   • Map connections and data flow                           │
│   • Detect architecture pattern                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 2: Smart Questions                       │
│   • Generate high-impact clarifying questions               │
│   • Prioritize by cost sensitivity                          │
│   • Multiple choice for easy answering                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Stage 3: Cost Estimation                       │
│   • Calculate per-service costs                             │
│   • Include hidden costs                                    │
│   • Generate optimization recommendations                   │
│   • Compare cloud providers                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        Output                               │
│   💰 Cost Breakdown | 💡 Optimizations | 📊 Comparisons     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Sample Output

### Input
- **Diagram:** 3-tier e-commerce architecture
- **Context:** "Fashion marketplace for tier-2/3 Indian cities. 50K daily users, 2M API requests/day."

### Output

#### 💰 Cost Estimate

| Service | Configuration | Monthly Cost | % of Total |
|---------|--------------|--------------|------------|
| EC2 (ASG) | 3x t3.medium | ₹6,500 | 8% |
| RDS MySQL | db.r5.large Multi-AZ | ₹25,000 | 31% |
| ElastiCache | cache.r5.large | ₹12,000 | 15% |
| ALB | Application LB | ₹3,500 | 4% |
| CloudFront | 500GB transfer | ₹4,000 | 5% |
| S3 | 500GB Standard | ₹1,000 | 1% |
| NAT Gateway | 2x (HA) | ₹9,500 | 12% |
| Data Transfer | 1TB egress | ₹7,500 | 9% |
| **Total** | | **₹81,000/month** | 100% |

#### 💡 Top Recommendations

1. **Switch to Graviton instances** → Save ₹1,300/month (20% compute savings)
2. **Use S3 Intelligent Tiering** → Save ₹400/month on storage
3. **Consider Reserved Instances (1yr)** → Save ₹18,000/month (22% overall)

---

## 🧪 Test Diagrams

Three sample diagrams are included for testing:

| Diagram | Description | Expected Cost Range |
|---------|-------------|---------------------|
| `3tier_ecommerce.svg` | E-commerce with ALB, EC2, RDS, Redis | ₹80K-150K/month |
| `serverless_processing.svg` | Document processing with Lambda, Textract | ₹8K-15K/month |
| `eks_microservices.svg` | Food delivery backend on EKS | ₹2L-3.5L/month |

---

## 🛠️ Supported Services

### AWS (Primary)
- **Compute:** EC2, Lambda, ECS, EKS, Fargate
- **Database:** RDS, DynamoDB, ElastiCache, DocumentDB
- **Storage:** S3, EBS, EFS
- **Networking:** ALB/NLB, CloudFront, API Gateway, NAT Gateway, VPC
- **AI/ML:** Textract, Rekognition, SageMaker
- **Other:** SQS, SNS, Secrets Manager, CloudWatch

### GCP (Comparison)
- Compute Engine, Cloud Run, GKE
- Cloud SQL, Firestore, Memorystore
- Cloud Storage, Cloud CDN

### Azure (Comparison)
- Virtual Machines, AKS, Functions
- Azure SQL, Cosmos DB
- Blob Storage, Azure CDN

---

## 🎬 Demo Video Script

**Duration:** 2 minutes

| Time | Content |
|------|---------|
| 0:00-0:15 | Problem: "Architects don't know costs until the bill arrives" |
| 0:15-0:30 | Draw simple architecture on whiteboard |
| 0:30-0:45 | Upload photo, add business context |
| 0:45-1:00 | AI parses diagram, identifies services |
| 1:00-1:15 | Answer 2 clarifying questions |
| 1:15-1:35 | Show cost breakdown with hidden costs highlighted |
| 1:35-1:50 | Show optimization recommendations |
| 1:50-2:00 | "From whiteboard to cost estimate in 90 seconds" |

---

## 📈 Why This Wins

### Judging Criteria Alignment

| Criteria | Weight | How We Score |
|----------|--------|--------------|
| **Real-world Impact** | 40% | Solves $100B+ cloud waste problem, saves teams hours of manual estimation |
| **Gemini 3 Pro Capabilities** | 30% | Multimodal (image→structured), reasoning (cost logic), agentic (follow-ups) |
| **Creativity** | 20% | Visual-first approach to cost estimation doesn't exist |
| **Presentation** | 10% | Clear demo: whiteboard sketch → instant savings |

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Google DeepMind](https://deepmind.google/) for Gemini 3 Pro
- [Kaggle](https://kaggle.com) for hosting the hackathon
- AWS/GCP/Azure pricing documentation

---

## 📬 Contact

**Your Name** — [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/cloudcost-ai](https://github.com/yourusername/cloudcost-ai)

---

<p align="center">
  Built with ☁️ for the Kaggle Gemini 3 Pro Hackathon 2025
</p>
